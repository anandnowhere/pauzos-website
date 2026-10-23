/**
 * Google Apps Script: Automated HDFC UPI Email Listener for Pauzos
 * Account: hello@stratexa.in (or the Gmail receiving HDFC transaction alerts)
 * Runs automatically every 1 minute with 0 server costs.
 */

const SUPABASE_URL = "https://suidnqsvuxaoqoyuqpys.supabase.co";
// Supabase Service Role Key (Admin access for inserting verified bank credits)
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWRucXN2dXhhb3FveXVxcHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc1MjUxNiwiZXhwIjoyMTA4MzI4NTE2fQ.Bo6vjGxIaTuWXw67ihOiXlHIg73z7ZSydFr4b2nuunw";

function checkHdfcUpiEmails() {
  // 1. Search unread credit alert emails from HDFC Bank
  const query = 'from:alerts@hdfcbank.net "credited" "UPI" is:unread';
  const threads = GmailApp.search(query, 0, 10);

  Logger.log("Found " + threads.length + " matching unread HDFC alert threads.");

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const msg of messages) {
      if (!msg.isUnread()) continue;

      const body = msg.getPlainBody();

      // 2. Extract 12-digit UTR (HDFC formats: "UPI reference number XXXXXXXXXXXX", "UPI/XXXXXXXXXXXX", or standalone 12 digits)
      const utrMatch = body.match(/(?:UPI(?:\s*ref(?:erence)?\s*(?:no|num|number)?)?[:\s\/-]+)(\d{12})/i) || body.match(/\b(\d{12})\b/);

      // 3. Extract Amount (e.g. "Rs. 249.00", "Rs 249", "INR 249.00")
      const amountMatch = body.match(/(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{2})?)/i);

      if (utrMatch && amountMatch) {
        const utr = utrMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

        // 4. Post to Supabase upi_payments table
        const payload = JSON.stringify({
          utr: utr,
          amount: amount,
          bank_timestamp: new Date().toISOString()
        });

        const options = {
          method: "post",
          contentType: "application/json",
          headers: {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": "Bearer " + SUPABASE_SERVICE_KEY,
            "Prefer": "resolution=ignore-duplicates"
          },
          payload: payload,
          muteHttpExceptions: true
        };

        const res = UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/upi_payments", options);
        Logger.log("Processed UTR " + utr + " (Rs " + amount + ") -> Response Code: " + res.getResponseCode());
      } else {
        Logger.log("Could not parse UTR or Amount in message: " + msg.getSubject());
      }

      // 5. Mark email as read so it is never re-processed
      msg.markRead();
    }
  }
}
