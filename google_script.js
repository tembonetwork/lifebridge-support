/**
 * LIFEBRIDGE SUPPORT - FREE SECURE FORM BACKEND
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Go to Google Drive (https://drive.google.com).
 * 2. Click "New" > "More" > "Google Apps Script" (If you don't see it, search/add it).
 * 3. Delete any default code in the editor and paste the code below.
 * 4. Replace "lifebridgesupport@gmail.com" on Line 27 with your target email if different.
 * 5. Click "Deploy" (top right) > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set the fields:
 *    - Description: LifeBridge Form Backend
 *    - Execute as: Me (your-google-account)
 *    - Who has access: Anyone (this is required so the website can send data to it)
 * 8. Click "Deploy". You may need to click "Authorize access" and grant permissions.
 * 9. Copy the "Web app URL" (it ends in /exec).
 * 10. Paste this URL into the config sections at the top of intake.html and interpreter.html.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Decode base64 PDF
    var pdfBytes = Utilities.base64Decode(data.pdf_base64);
    var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', data.filename || 'Form_Submission.pdf');
    
    // Save to a folder on Google Drive
    var folderName = "LifeBridge Form Submissions";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    var file = folder.createFile(pdfBlob);
    
    // Email the PDF file
    MailApp.sendEmail({
      to: "lifebridgesupport@gmail.com",
      subject: data.subject || "New LifeBridge Form Submission",
      body: "Hello,\n\nA new secure form submission has been received. The signed PDF is attached to this email and has also been saved to your Google Drive folder: '" + folderName + "'.\n\nSubmission Details:\n" + (data.details || ""),
      attachments: [pdfBlob]
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", fileUrl: file.getUrl() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handle CORS preflight options request
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
