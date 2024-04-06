var nodemailer = require('nodemailer');
const fs = require('fs');

const moment = (formatedate) =>{
    var moment = require('moment');
    return moment().format(formatedate);
}

const generateCode = (length,type="") =>{
    if(type === "numbers"){
        var chars = '0123456789'
    }else{
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    result=""
    for (var icount = length; icount > 0; --icount)
        result += chars[Math.round(Math.random() * (chars.length - 1))]
    return result;
}

const sendMail = (sendto,subject,message) => {

	// Load the HTML email template
	var htmlTemplate = fs.readFileSync('mail_template/otp.html', 'utf-8');
	console.log(message);
	const otp = message.otp; 
	const otp_title = message.otp_title; 
	const fullname = message.fullname;
	htmlTemplate = htmlTemplate.replace("{{otp_number}}", otp);
	htmlTemplate = htmlTemplate.replace("{{otp_title}}", otp_title);
	htmlTemplate = htmlTemplate.replace("{{fullname}}", fullname);

    var transporter = nodemailer.createTransport({
        
        host: 'playtoconquer.com',
        name: 'www.playtoconquer.com',
        port: 465,
        secure: 'ssl',
        auth: {
            user: 'no-reply@playtoconquer.com',
            pass: '+vNfw-#d]+qS'
        }
        });
        
        var mailOptions = {
        from: '"Play to Conquer" <no-reply@playtoconquer.com>',
        to: sendto,
        subject: subject,
        html: htmlTemplate
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
const onlyNumbers = (array) => {
    return array.every(element => {
        return !isNaN(element);
    });
}

const preg_match = (regex, str) => {
  return (new RegExp(regex).test(str))
}

const capitalText = (text) => {
  return text.substring(0,1).toUpperCase() + text.substring(1,text.length);
}

const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)

module.exports = {
    moment,
    generateCode,
    sendMail,
    onlyNumbers,
    preg_match,
    capitalText,
    getAge
}