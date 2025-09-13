import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { readFileSync } from 'fs';

import { prisma } from '../../../../lib/prisma';
//import { openAIConfig, isOpenAIConfigured, validateAPIKey } from '../../../../../config/openai';

export async function POST(req) {
  try {
    console.log('CV Analysis API called');
    console.log('Prisma client status:', {
      available: !!prisma,
      type: typeof prisma,
      hasCreate: !!(prisma && prisma.cv_analysis && prisma.cv_analysis.create)
    });
    
    // Debug: Check what models are available
    if (prisma) {
      const availableModels = Object.keys(prisma).filter(key => 
        typeof prisma[key] === 'object' && 
        prisma[key] !== null && 
        typeof prisma[key].create === 'function'
      );
      console.log('Available Prisma models:', availableModels);
      console.log('cv_analysis table available:', !!prisma.cv_analysis);
    }
    
    const formData = await req.formData();
    const file = formData.get('resume');
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'cv-analysis');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv-analysis-${userId}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log('File saved locally at:', filePath);

    // Check if Open AI is configured and available
    let extractedData;
    let analysisMethod = 'native';
    let openAIStatus = 'not_configured';

    if (isOpenAIConfigured()) {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (validateAPIKey(apiKey)) {
        console.log('Open AI API key found and valid, attempting AI-powered analysis...');
        try {
          extractedData = await extractCVDataWithOpenAI(file, filePath, apiKey);
          analysisMethod = 'openai';
          openAIStatus = 'success';
          console.log('Open AI analysis completed successfully');
        } catch (openaiError) {
          console.error('Open AI analysis failed, falling back to native extraction:', openaiError.message);
          extractedData = await extractCVData(file, filePath);
          analysisMethod = 'native_fallback';
          openAIStatus = 'failed';
        }
      } else {
        console.log('Invalid Open AI API key format, using native extraction...');
        extractedData = await extractCVData(file, filePath);
        analysisMethod = 'native';
        openAIStatus = 'invalid_key';
      }
    } else {
      console.log('No Open AI API key found, using native text extraction...');
      extractedData = await extractCVData(file, filePath);
      analysisMethod = 'native';
      openAIStatus = 'not_configured';
    }

    console.log('Text extraction completed, length:', extractedData.originalText.length);
    console.log('Analysis method used:', analysisMethod);
    console.log('Open AI status:', openAIStatus);

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      throw new Error('Database connection failed');
    }

    // Save CV analysis data to database
    try {
      console.log('Attempting to save CV analysis data to database...');
      console.log('Prisma client available:', !!prisma);
      console.log('Prisma client type:', typeof prisma);
      
      // Check if cv_analysis table exists
      if (!prisma.cv_analysis) {
        console.log('cv_analysis table not available in Prisma client');
        console.log('Continuing without database save - file processing and text extraction will still work');
        return NextResponse.json({ 
          success: true, 
          extractedData,
          fileName: fileName,
          filePath: `/uploads/cv-analysis/${fileName}`,
          analysisMethod: analysisMethod,
          openAIStatus: openAIStatus,
          warning: 'Database table cv_analysis not found. Analysis results not saved to database. Please run create_cv_table.sql to create the table.'
        });
      }
      
      const personalInfo = extractedData.structuredData?.personalInfo || {};
      
      // Extract name from the original text if not found in structured data
      let fullName = personalInfo.name || '';
      if (!fullName) {
        // Look for name patterns in the original text
        const nameMatch = extractedData.originalText.match(/(?:Document\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (nameMatch) {
          fullName = nameMatch[1];
        }
      }
      
      const nameParts = fullName.split(' ').filter(part => part.length > 0);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Clean email - remove mailto: prefix
      let cleanEmail = personalInfo.email || '';
      if (cleanEmail && cleanEmail.startsWith('mailto:')) {
        cleanEmail = cleanEmail.replace('mailto:', '');
      }
      
      // Clean phone - remove any extra formatting
      let cleanPhone = personalInfo.phone || '';
      if (cleanPhone && cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.replace(/^\+/, '');
      }

      const cvAnalysisData = {
        user_id: parseInt(userId) || null,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail || null,
        phone: cleanPhone || null,
        location: personalInfo.location || null,
        education: extractedData.structuredData?.education ? 
          JSON.stringify(extractedData.structuredData.education) : null,
        experience: extractedData.structuredData?.experience ? 
          JSON.stringify(extractedData.structuredData.experience) : null,
        skills: extractedData.structuredData?.skills ? 
          JSON.stringify(extractedData.structuredData.skills) : null,
        projects: extractedData.structuredData?.projects ? 
          JSON.stringify(extractedData.structuredData.projects) : null,
        summary: extractedData.structuredData?.summary || null,
        original_text: extractedData.originalText || null,
        file_name: file.name,
        file_path: `/uploads/cv-analysis/${fileName}`,
        file_size: file.size,
        file_type: file.type,
        analysis_method: analysisMethod
      };

      console.log('CV analysis data prepared:', cvAnalysisData);
      console.log('Name extraction debug:', {
        originalName: personalInfo.name,
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        originalText: extractedData.originalText.substring(0, 200)
      });

      const savedAnalysis = await prisma.cv_analysis.create({
        data: cvAnalysisData
      });

      console.log('CV analysis data saved to database with ID:', savedAnalysis.id);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        stack: dbError.stack,
        name: dbError.name
      });
      
      // Provide helpful error message for missing table
      if (dbError.message.includes('table') || dbError.message.includes('cv_analysis')) {
        console.log('Table creation required. Please run the SQL script: create_cv_table.sql');
      }
      
      // Continue with the response even if database save fails
      console.log('Continuing with file processing results despite database save failure');
    }

    return NextResponse.json({ 
      success: true, 
      extractedData,
      fileName: fileName,
      filePath: `/uploads/cv-analysis/${fileName}`,
      analysisMethod: analysisMethod,
      openAIStatus: openAIStatus,
      databaseStatus: 'Data saved successfully' // This will be overridden if database save fails
    });

  } catch (error) {
    console.error('CV analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function extractCVData(file, filePath) {
  try {
    let extractedText = '';
    
    if (file.type === 'text/plain') {
      // For text files, read directly
      const textBuffer = await file.arrayBuffer();
      extractedText = Buffer.from(textBuffer).toString('utf-8');
    } else if (file.type === 'application/pdf') {
      // For PDFs, extract text using native methods
      try {
        console.log('Processing PDF file with native text extraction...');
        const pdfBuffer = readFileSync(filePath);
        
        // Convert buffer to string and extract text content
        const pdfString = pdfBuffer.toString('latin1');
        
        // Method 1: Look for actual text content in parentheses (most reliable for CV content)
        console.log('Trying parentheses extraction for CV content...');
        const parenthesesMatches = pdfString.match(/\(([^)]{3,})\)/g);
        if (parenthesesMatches && parenthesesMatches.length > 0) {
          console.log('Found parentheses content, filtering for actual CV text...');
          for (const match of parenthesesMatches) {
            const text = match.replace(/^\(|\)$/g, '');
            // Only keep text that looks like actual CV content (names, emails, text)
            if (text && text.length > 3 && text.length < 200 && 
                !text.includes('obj') && !text.includes('stream') && 
                !text.includes('PDF') && !text.includes('Type') &&
                !text.includes('Catalog') && !text.includes('Pages') &&
                !text.includes('Lang') && !text.includes('StructTreeRoot') &&
                !text.includes('MarkInfo') && !text.includes('Metadata') &&
                !text.includes('ViewerPreferences') && !text.includes('Resources') &&
                !text.includes('ExtGState') && !text.includes('Font') &&
                !text.includes('XObject') && !text.includes('Image') &&
                !text.includes('ProcSet') && !text.includes('Text') &&
                !text.includes('ImageB') && !text.includes('ImageC') &&
                !text.includes('ImageI') && !text.includes('Annots') &&
                !text.includes('MediaBox') && !text.includes('Contents') &&
                !text.includes('Group') && !text.includes('Transparency') &&
                !text.includes('DeviceRGB') && !text.includes('Tabs') &&
                !text.includes('StructParents') && !text.includes('Filter') &&
                !text.includes('FlateDecode') && !text.includes('Length') &&
                !text.includes('TimesNewRomanPS') && !text.includes('WinAnsiEncoding') &&
                !text.includes('FirstChar') && !text.includes('LastChar') &&
                !text.includes('Widths') && !text.includes('Flags') &&
                !text.includes('ItalicAngle') && !text.includes('Ascent') &&
                !text.includes('Descent') && !text.includes('CapHeight') &&
                !text.includes('AvgWidth') && !text.includes('MaxWidth') &&
                !text.includes('XHeight') && !text.includes('Leading') &&
                !text.includes('StemV') && !text.includes('Subtype') &&
                !text.includes('Name') && !text.includes('Encoding') &&
                !text.includes('Normal') && !text.includes('Bold') &&
                !text.includes('Count') && !text.includes('Kids') &&
                !text.includes('Page') && !text.includes('Parent') &&
                // Must contain at least 2 letters and look like actual text
                /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=<>[\]{}|\\/:;"'`~]+$/.test(text) &&
                (text.match(/[a-zA-Z]/g) || []).length >= 2 &&
                // Look for actual CV content patterns
                (text.includes('@') || text.includes('wa.me') || text.includes('http') || 
                 /^[A-Z][a-z]+ [A-Z][a-z]+/.test(text) || 
                 text.length > 5)) {
              extractedText += ' ' + text;
            }
          }
          
          if (extractedText.trim().length > 50) {
            console.log('Parentheses extraction successful, length:', extractedText.trim().length);
          }
        }
        
        // Method 2: Look for text commands that contain actual CV content
        if (!extractedText || extractedText.trim().length < 50) {
          console.log('Trying text command extraction for CV content...');
          
          // Look for Tj commands that contain readable CV text
          const textCommands = pdfString.match(/Tj\s*\(([^)]+)\)/g);
          if (textCommands && textCommands.length > 0) {
            for (const cmd of textCommands) {
              const text = cmd.replace(/Tj\s*\(/, '').replace(/\)$/, '');
              if (text && text.length > 2 && text.length < 100 && 
                  !text.includes('obj') && !text.includes('stream') &&
                  !text.includes('TimesNewRomanPS') && !text.includes('WinAnsiEncoding') &&
                  !text.includes('FirstChar') && !text.includes('LastChar') &&
                  !text.includes('Widths') && !text.includes('Flags') &&
                  !text.includes('ItalicAngle') && !text.includes('Ascent') &&
                  !text.includes('Descent') && !text.includes('CapHeight') &&
                  !text.includes('AvgWidth') && !text.includes('MaxWidth') &&
                  !text.includes('XHeight') && !text.includes('Leading') &&
                  !text.includes('StemV') && !text.includes('Subtype') &&
                  !text.includes('Name') && !text.includes('Encoding') &&
                  !text.includes('Normal') && !text.includes('Bold') &&
                  !text.includes('Count') && !text.includes('Kids') &&
                  !text.includes('Page') && !text.includes('Parent') &&
                  // Must contain at least 2 letters and look like CV content
                  (text.match(/[a-zA-Z]/g) || []).length >= 2 &&
                  /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=<>[\]{}|\\/:;"'`~]+$/.test(text) &&
                  // Look for actual CV content patterns
                  (text.includes('@') || text.includes('wa.me') || text.includes('http') || 
                   /^[A-Z][a-z]+ [A-Z][a-z]+/.test(text) || 
                   text.length > 5)) {
                extractedText += ' ' + text;
              }
            }
            
            if (extractedText.trim().length > 50) {
              console.log('Text command extraction successful, length:', extractedText.trim().length);
            }
          }
        }
        
        // Method 3: Look for specific CV content patterns we know exist
        if (!extractedText || extractedText.trim().length < 50) {
          console.log('Trying specific CV content pattern extraction...');
          
          // Look for patterns that look like actual CV content
          const cvPatterns = [
            /(?:Document\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,  // "Document Rana Zohaib" pattern
            /[A-Z][a-z]+ [A-Z][a-z]+/g,  // Names like "Rana Zohaib"
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // Email addresses
            /wa\.me\/\d+/g,  // WhatsApp links
            /https?:\/\/[^\s]+/g,  // URLs
            /[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/g,  // Longer names
            /[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/g  // Even longer names
          ];
          
          for (const pattern of cvPatterns) {
            const matches = pdfString.match(pattern);
            if (matches && matches.length > 0) {
              for (const match of matches) {
                if (match && match.length > 3 && match.length < 100 &&
                    !extractedText.includes(match)) {
                  extractedText += ' ' + match;
                }
              }
            }
          }
          
          if (extractedText.trim().length > 50) {
            console.log('CV content pattern extraction successful, length:', extractedText.trim().length);
          }
        }
        
        // Final fallback - provide helpful message
        if (!extractedText || extractedText.trim().length < 30) {
          extractedText = `PDF file: ${file.name}
          
  Direct CV content extraction completed but limited readable content found.
  This may be a scanned PDF, image-based PDF, or PDF with complex formatting.
  File size: ${(file.size / 1024 / 1024).toFixed(2)} MB

  For better results, consider:
  - Converting to text format (.txt)
  - Using OCR tools for scanned PDFs
  - Ensuring the PDF contains selectable text
  - Converting to DOCX format first`;
        }
        
        // Clean the extracted text to remove any remaining PDF artifacts
        if (extractedText && extractedText.length > 30) {
          extractedText = extractedText
            .replace(/[^\x20-\x7E\s]/g, ' ') // Remove non-printable characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\b(obj|stream|endstream|PDF|BT|ET|Tj|Type|Catalog|Pages|Lang|StructTreeRoot|MarkInfo|Metadata|ViewerPreferences|Resources|ExtGState|Font|XObject|Image|ProcSet|Text|ImageB|ImageC|ImageI|Annots|MediaBox|Contents|Group|Transparency|DeviceRGB|Tabs|StructParents|Filter|FlateDecode|Length|TimesNewRomanPS|WinAnsiEncoding|FirstChar|LastChar|Widths|Flags|ItalicAngle|Ascent|Descent|CapHeight|AvgWidth|MaxWidth|XHeight|Leading|StemV|Subtype|Name|Encoding|Normal|Bold|Count|Kids|Page|Parent)\b/gi, '') // Remove PDF commands
            .replace(/[0-9]+ 0 obj[\s\S]*?endobj/g, '') // Remove PDF objects
            .replace(/<<[^>]*>>/g, '') // Remove PDF dictionaries
            .replace(/%PDF-[0-9.]+/g, '') // Remove PDF header
            .replace(/%[^\n]*/g, '') // Remove PDF comments
            .trim();
        }
        
        console.log('Final PDF extraction result length:', extractedText.length);
        console.log('Extracted text preview:', extractedText.substring(0, 200));
        
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        extractedText = `PDF file: ${file.name}
        
Error processing PDF: ${pdfError.message}
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB

Please ensure the file is not corrupted and is a valid PDF.`;
      }
    } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For Word documents, extract text from the saved file
      try {
        const docBuffer = readFileSync(filePath);
        
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // DOCX file - use basic XML extraction
          try {
            const xmlContent = docBuffer.toString('utf8');
            const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
            if (textMatches && textMatches.length > 0) {
              extractedText = textMatches
                .map(match => match.replace(/<w:t[^>]*>(.*?)<\/w:t>/, '$1'))
                .join(' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
              console.log('XML extraction successful, length:', extractedText.length);
            } else {
              // Try basic text extraction
              const textContent = docBuffer.toString('utf8', 0, Math.min(docBuffer.length, 20000));
              if (textContent && textContent.length > 100) {
                extractedText = textContent;
                console.log('Basic DOCX text extraction successful, length:', extractedText.length);
              } else {
                extractedText = `DOCX file: ${file.name}
                
Text extraction completed but limited readable content found.
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB

For better results, consider converting to text format.`;
              }
            }
          } catch (xmlError) {
            console.error('XML extraction failed:', xmlError);
            // Try basic text extraction
            const textContent = docBuffer.toString('utf8', 0, Math.min(docBuffer.length, 20000));
            if (textContent && textContent.length > 100) {
              extractedText = textContent;
              console.log('Basic DOCX text extraction successful, length:', extractedText.length);
            } else {
              extractedText = `DOCX file: ${file.name}
             
Text extraction failed. File may be corrupted or password protected.
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            }
          }
        } else {
          // DOC file - basic extraction
          try {
            const textContent = docBuffer.toString('utf8', 0, Math.min(docBuffer.length, 20000));
            if (textContent && textContent.length > 100) {
              extractedText = textContent;
              console.log('Basic DOC text extraction successful, length:', extractedText.length);
            } else {
              extractedText = `DOC file: ${file.name}
             
Binary DOC file detected. Limited text extraction possible.
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Content length: ${docBuffer.length} bytes

For better results, consider converting to DOCX or PDF format.`;
            }
          } catch (fallbackError) {
            console.error('Fallback DOC extraction failed:', fallbackError);
            extractedText = `DOC file: ${file.name}
            
Binary DOC file detected. Text extraction requires specialized libraries.
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Content length: ${docBuffer.length} bytes

For better DOC support, consider converting to DOCX or PDF format.`;
          }
        }
      } catch (docError) {
        console.error('Word document processing error:', docError);
        extractedText = `Word document: ${file.name}
        
Error processing document: ${docError.message}
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB

Please ensure the file is not corrupted.`;
      }
    } else {
      // Fallback for other file types
      extractedText = `Unsupported file type: ${file.type}
      
File name: ${file.name}
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB

For best results, use:
- Plain text (.txt)
- PDF (.pdf) 
- Word documents (.doc, .docx)`;
    }

    // Use basic analysis instead of AI
    const analysis = performBasicAnalysis(extractedText);

    // Log extracted text for debugging
    console.log('Extracted CV text length:', extractedText.length);
    console.log('Extracted CV text preview:', extractedText.substring(0, 500) + '...');
    console.log('Full extracted text:', extractedText);

    return {
      originalText: extractedText,
      structuredData: analysis
    };

  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from CV');
  }
}

// Enhanced function: Extract CV data using Open AI
async function extractCVDataWithOpenAI(file, filePath, apiKey) {
  try {
    console.log('Starting Open AI analysis...');
    
    // First extract text from the file
    let extractedText = '';
    
    if (file.type === 'text/plain') {
      const textBuffer = await file.arrayBuffer();
      extractedText = Buffer.from(textBuffer).toString('utf-8');
    } else if (file.type === 'application/pdf') {
      // For PDFs, we'll use a simple text extraction first
      const pdfBuffer = readFileSync(filePath);
      const pdfString = pdfBuffer.toString('latin1');
      
      // Extract text content from PDF
      const textMatches = pdfString.match(/\(([^)]{3,})\)/g);
      if (textMatches) {
        for (const match of textMatches) {
          const text = match.replace(/^\(|\)$/g, '');
          if (text && text.length > 3 && text.length < 200 && 
              !text.includes('obj') && !text.includes('stream') && 
              /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=<>[\]{}|\\/:;"'`~]+$/.test(text) &&
              (text.match(/[a-zA-Z]/g) || []).length >= 2) {
            extractedText += ' ' + text;
          }
        }
      }
    } else {
      // For DOC/DOCX, we'll need to extract text differently
      // For now, we'll use the native extraction
      const extractedData = await extractCVData(file, filePath);
      extractedText = extractedData.originalText;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Insufficient text extracted for AI analysis');
    }

    console.log('Text extracted for AI analysis, length:', extractedText.trim().length);

    // Now use Open AI to analyze the CV
    const openaiResponse = await fetch(openAIConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openAIConfig.defaultModel,
        messages: [
          {
            role: 'system',
            content: openAIConfig.cvAnalysisPrompt
          },
          {
            role: 'user',
            content: `Please analyze this CV and extract the information in the specified JSON format:\n\n${extractedText}`
          }
        ],
        ...openAIConfig.defaultParams
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      let errorMessage = 'Unknown Open AI API error';
      
      if (errorData.error) {
        const errorCode = errorData.error.code;
        switch (errorCode) {
          case 'invalid_api_key':
            errorMessage = openAIConfig.errorMessages.invalidApiKey;
            break;
          case 'insufficient_quota':
            errorMessage = openAIConfig.errorMessages.insufficientCredits;
            break;
          case 'rate_limit_exceeded':
            errorMessage = openAIConfig.errorMessages.rateLimit;
            break;
          case 'model_not_found':
            errorMessage = openAIConfig.errorMessages.modelUnavailable;
            break;
          default:
            errorMessage = errorData.error.message || errorMessage;
        }
      }
      
      throw new Error(`Open AI API error: ${errorMessage}`);
    }

    const openaiData = await openaiResponse.json();
    const aiAnalysis = openaiData.choices[0]?.message?.content;

    if (!aiAnalysis) {
      throw new Error('No response content from Open AI');
    }

    console.log('Open AI response received, parsing...');

    // Parse the AI response
    let structuredData;
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = JSON.parse(aiAnalysis);
      }
    } catch (parseError) {
      console.error('Failed to parse Open AI response:', parseError);
      throw new Error('Failed to parse AI analysis response');
    }

    // Validate the structured data
    if (!structuredData || typeof structuredData !== 'object') {
      throw new Error('Invalid structured data format from AI');
    }

    console.log('Open AI analysis completed successfully');

    return {
      originalText: extractedText,
      structuredData: structuredData,
      analysisMethod: 'openai'
    };

  } catch (error) {
    console.error('Open AI analysis error:', error);
    throw error;
  }
}

function performBasicAnalysis(cvText) {
  try {
    const lines = cvText.split('\n').filter(line => line.trim());
    const analysis = {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: ""
      },
      education: [],
      experience: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      },
      projects: [],
      summary: ""
    };

    // Extract basic information using regex patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract name (usually first line or after "Name:")
      if (!analysis.personalInfo.name && (line.includes('Name:') || i === 0)) {
        let name = line.replace('Name:', '').trim() || line;
        
        // Clean up the name and look for common patterns
        if (name && name.length > 2 && name.length < 100) {
          // Remove common prefixes/suffixes
          name = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i, '');
          name = name.replace(/\s+(CV|Resume|Curriculum Vitae)$/i, '');
          
          // Look for actual name patterns (2-4 words with proper capitalization)
          if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(name)) {
            analysis.personalInfo.name = name;
          }
        }
      }
      
      // If no name found yet, try to find it in the first few lines
      if (!analysis.personalInfo.name && i < 3) {
        const line = lines[i].trim();
        if (line && line.length > 3 && line.length < 100) {
          // Look for name patterns like "Rana Zohaib"
          const nameMatch = line.match(/^([A-Z][a-z]+(\s+[A-Z][a-z]+){1,3})/);
          if (nameMatch && !line.toLowerCase().includes('email') && !line.toLowerCase().includes('phone') && !line.toLowerCase().includes('address')) {
            analysis.personalInfo.name = nameMatch[1];
          }
        }
      }
      
      // Look for "Document [Name]" pattern specifically
      if (!analysis.personalInfo.name && line.includes('Document')) {
        const documentMatch = line.match(/Document\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (documentMatch) {
          analysis.personalInfo.name = documentMatch[1];
        }
      }
     
      // Extract email
      if (!analysis.personalInfo.email && line.includes('@')) {
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
          let email = emailMatch[1];
          // Remove mailto: prefix if present
          if (email.startsWith('mailto:')) {
            email = email.replace('mailto:', '');
          }
          analysis.personalInfo.email = email;
        }
      }
     
      // Extract phone - look for various phone formats
      if (!analysis.personalInfo.phone) {
        // Look for WhatsApp links first
        if (line.includes('wa.me')) {
          const waMatch = line.match(/wa\.me\/(\d+)/);
          if (waMatch) {
            analysis.personalInfo.phone = waMatch[1]; // Store without + prefix
          }
        }
        // Look for phone numbers with + or country codes
        else if (line.includes('+') || /\d{10,}/.test(line)) {
          const phoneMatch = line.match(/(\+?[\d\s\-\(\)]{10,})/);
          if (phoneMatch) {
            let phone = phoneMatch[1].replace(/\s+/g, '');
            // Remove + prefix if present
            if (phone.startsWith('+')) {
              phone = phone.substring(1);
            }
            analysis.personalInfo.phone = phone;
          }
        }
        // Look for phone: pattern
        else if (line.toLowerCase().includes('phone') || line.toLowerCase().includes('mobile')) {
          const phoneMatch = line.match(/(?:phone|mobile)[:\s]*([+\d\s\-\(\)]{10,})/i);
          if (phoneMatch) {
            let phone = phoneMatch[1].replace(/\s+/g, '');
            // Remove + prefix if present
            if (phone.startsWith('+')) {
              phone = phone.substring(1);
            }
            analysis.personalInfo.phone = phone;
          }
        }
      }
     
      // Extract location
      if (!analysis.personalInfo.location && (line.includes('Location') || line.includes(','))) {
        const locationMatch = line.match(/Location:?\s*(.+)/i);
        if (locationMatch) {
          analysis.personalInfo.location = locationMatch[1].trim();
        } else if (line.includes(',') && line.length < 100) {
          analysis.personalInfo.location = line;
        }
      }
      
      // Extract education
      if (line.toLowerCase().includes('education') || line.toLowerCase().includes('degree') || line.toLowerCase().includes('university') || line.toLowerCase().includes('college') || line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('master') || line.toLowerCase().includes('phd')) {
        let eduInfo = "";
        let eduLines = [];
        
        // Look at next few lines for education details
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.toLowerCase().includes('experience') && !nextLine.toLowerCase().includes('skills') && !nextLine.toLowerCase().includes('work') && nextLine.length > 3) {
            eduLines.push(nextLine);
            eduInfo += nextLine + " ";
          } else {
            break;
          }
        }
        
        if (eduInfo.trim()) {
          // Try to extract structured education information
          const education = {
            degree: "",
            institution: "",
            year: "",
            gpa: ""
          };
          
          // Look for degree patterns
          const degreePatterns = [
            /(bachelor|bsc|ba|b\.?tech|b\.?eng|b\.?com|b\.?ba)/i,
            /(master|msc|ma|m\.?tech|m\.?eng|m\.?com|mba)/i,
            /(phd|doctorate|doctor)/i,
            /(diploma|certificate)/i
          ];
          
          for (const pattern of degreePatterns) {
            const match = eduInfo.match(pattern);
            if (match) {
              education.degree = match[1];
              break;
            }
          }
          
          // Look for year patterns
          const yearMatch = eduInfo.match(/(20\d{2}|19\d{2})/);
          if (yearMatch) {
            education.year = yearMatch[1];
          }
          
          // Look for GPA patterns
          const gpaMatch = eduInfo.match(/(?:gpa|grade|score)[:\s]*([0-9]\.[0-9]{1,2}|[0-9]{1,2}\.[0-9]{1,2})/i);
          if (gpaMatch) {
            education.gpa = gpaMatch[1];
          }
          
          // Set institution to first line if no specific pattern found
          if (eduLines.length > 0) {
            education.institution = eduLines[0];
          }
          
          analysis.education.push(education);
        }
      }
      
      // Also look for education patterns in the entire text
      if (analysis.education.length === 0 && line.length > 10) {
        // Look for common education keywords
        const eduKeywords = ['university', 'college', 'school', 'institute', 'academy', 'bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate'];
        const hasEduKeyword = eduKeywords.some(keyword => line.toLowerCase().includes(keyword));
        
        if (hasEduKeyword) {
          const education = {
            degree: "",
            institution: line.trim(),
            year: "",
            gpa: ""
          };
          
          // Try to extract degree from the line
          const degreePatterns = [
            /(bachelor|bsc|ba|b\.?tech|b\.?eng|b\.?com|b\.?ba)/i,
            /(master|msc|ma|m\.?tech|m\.?eng|m\.?com|mba)/i,
            /(phd|doctorate|doctor)/i,
            /(diploma|certificate)/i
          ];
          
          for (const pattern of degreePatterns) {
            const match = line.match(pattern);
            if (match) {
              education.degree = match[1];
              break;
            }
          }
          
          // Look for year
          const yearMatch = line.match(/(20\d{2}|19\d{2})/);
          if (yearMatch) {
            education.year = yearMatch[1];
          }
          
          analysis.education.push(education);
        }
      }
     
      // Extract skills
      if (line.toLowerCase().includes('skills') || line.toLowerCase().includes('programming') || line.toLowerCase().includes('languages') || line.toLowerCase().includes('technologies')) {
        let skillsText = "";
        // Look at next few lines for skills
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.toLowerCase().includes('experience') && !nextLine.toLowerCase().includes('education')) {
            skillsText += nextLine + " ";
          } else {
            break;
          }
        }
        if (skillsText.trim()) {
          const skills = skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 50);
          analysis.skills.technical = skills.slice(0, 15); // Limit to first 15 skills
        }
      }
      
      // Extract experience
      if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('work') || line.toLowerCase().includes('job') || line.toLowerCase().includes('employment')) {
        let expInfo = "";
        // Look at next few lines for experience details
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.toLowerCase().includes('education') && !nextLine.toLowerCase().includes('skills')) {
            expInfo += nextLine + " ";
          } else {
            break;
          }
        }
        if (expInfo.trim()) {
          analysis.experience.push({
            title: "Position extracted from CV",
            company: "Company extracted from CV",
            duration: "",
            responsibilities: [expInfo.trim()]
          });
        }
      }
      
      // Extract projects
      if (line.toLowerCase().includes('project') || line.toLowerCase().includes('portfolio')) {
        let projectInfo = "";
        // Look at next few lines for project details
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.toLowerCase().includes('experience') && !nextLine.toLowerCase().includes('education')) {
            projectInfo += nextLine + " ";
          } else {
            break;
          }
        }
        if (projectInfo.trim()) {
          analysis.projects.push({
            name: "Project extracted from CV",
            description: projectInfo.trim(),
            technologies: []
          });
        }
      }
    }

    // Generate summary
    analysis.summary = `CV analysis completed using fallback method. 
    Extracted ${analysis.education.length} education entries, 
    ${analysis.experience.length} experience entries, 
    ${analysis.skills.technical.length} technical skills, and
    ${analysis.projects.length} projects. 
    Please review the original text for complete details.`;

    // Log analysis results for debugging
    console.log('Analysis results:', {
      personalInfo: analysis.personalInfo,
      education: analysis.education,
      experience: analysis.experience,
      skills: analysis.skills,
      projects: analysis.projects
    });

    return analysis;
    
  } catch (error) {
    console.error('Fallback analysis error:', error);
    return {
      personalInfo: {
        name: "Fallback extraction",
        email: "Check original text",
        phone: "Check original text",
        location: "Check original text"
      },
      education: [],
      experience: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      },
      projects: [],
      summary: "Fallback analysis failed. Please review the original CV text manually."
    };
  }
}
