const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

//not an exports.generate mail, its not needed anywhere outside of this file :)
const generateHTML = (filename, options = {}) => {
  //dirname is always the current directory we are running this from, this is harddrive/desktop/starterfiles/handlers
  const html = pug.renderFile(`${__dirname}/../views/email/password-reset.pug`, options);
  const inlined = juice(html);
  return inlined;
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Mathew <mathewhleland@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text // could also be text: text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
}