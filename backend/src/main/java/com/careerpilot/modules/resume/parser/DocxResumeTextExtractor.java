package com.careerpilot.modules.resume.parser;

import com.careerpilot.modules.resume.exception.ResumeException;
import com.careerpilot.modules.resume.validation.ResumeFileValidator;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.io.ByteArrayInputStream;

@Component
public class DocxResumeTextExtractor implements ResumeTextExtractor {
    public boolean supports(String mime){return ResumeFileValidator.DOCX.equals(mime);}
    public String extract(byte[] bytes){
        try(XWPFDocument document=new XWPFDocument(new ByteArrayInputStream(bytes))){StringBuilder text=new StringBuilder();
            for(IBodyElement element:document.getBodyElements()){
                if(element instanceof XWPFParagraph p)append(text,p.getText());
                else if(element instanceof XWPFTable table)for(XWPFTableRow row:table.getRows()){String line=row.getTableCells().stream().map(XWPFTableCell::getText).reduce((a,b)->a+" | "+b).orElse("");append(text,line);}
            }
            String result=TextNormalizer.normalize(text.toString());if(result.isBlank())throw new ResumeException(HttpStatus.UNPROCESSABLE_ENTITY,"DOCX contains no extractable text");return result;
        }catch(ResumeException e){throw e;}catch(Exception e){throw new ResumeException(HttpStatus.UNPROCESSABLE_ENTITY,"DOCX is invalid or cannot be parsed");}
    }
    private void append(StringBuilder b,String value){if(value!=null&&!value.isBlank()){if(!b.isEmpty())b.append('\n');b.append(value);}}
}
