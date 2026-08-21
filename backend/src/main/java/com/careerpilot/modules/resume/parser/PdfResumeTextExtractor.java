package com.careerpilot.modules.resume.parser;

import com.careerpilot.modules.resume.exception.ResumeException;
import com.careerpilot.modules.resume.validation.ResumeFileValidator;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class PdfResumeTextExtractor implements ResumeTextExtractor {
    public boolean supports(String mime){return ResumeFileValidator.PDF.equals(mime);}
    public String extract(byte[] bytes){
        try(PDDocument document=Loader.loadPDF(bytes)){
            if(document.isEncrypted())throw new ResumeException(HttpStatus.UNPROCESSABLE_ENTITY,"Encrypted PDF resumes are not supported");
            PDFTextStripper stripper=new PDFTextStripper();StringBuilder text=new StringBuilder();
            for(int page=1;page<=document.getNumberOfPages();page++){stripper.setStartPage(page);stripper.setEndPage(page);if(!text.isEmpty())text.append('\n');text.append(stripper.getText(document));}
            String result=TextNormalizer.normalize(text.toString());if(result.isBlank())throw new ResumeException(HttpStatus.UNPROCESSABLE_ENTITY,"PDF contains no extractable text");return result;
        }catch(ResumeException e){throw e;}catch(Exception e){throw new ResumeException(HttpStatus.UNPROCESSABLE_ENTITY,"PDF is corrupted, encrypted, or cannot be parsed");}
    }
}
