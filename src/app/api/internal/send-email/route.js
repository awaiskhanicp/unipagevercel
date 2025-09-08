import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const data = await request.json();

  console.log('Received email request:', data); // Debug log

  // Validate required fields
  if (!data.to || !data.subject || !data.html) {
    console.error('Missing required fields');
    return NextResponse.json(
      { success: false, error: 'Missing required fields: to, subject, or html' },
      { status: 400 }
    );
  }

  try {
    // In development, optionally short-circuit to avoid SMTP errors and terminal spam
    const missingEnv = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD;
    const devMode = process.env.NODE_ENV !== 'production';
    const emailSendingDisabled = process.env.ALLOW_EMAIL_SENDING !== 'true';

    if (devMode && (missingEnv || emailSendingDisabled)) {
      console.warn('Email sending skipped (dev mode or missing SMTP env).');
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        message: 'Email sending is disabled in development or SMTP env missing.'
      });
    }
    console.log('Creating transporter with:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Universities Page" <${process.env.SMTP_USER}>`,
      ...data
    };

    console.log('Sending email with options:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}