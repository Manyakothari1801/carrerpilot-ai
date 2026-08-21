package com.careerpilot.modules.resume.parser;

import com.careerpilot.modules.resume.entity.SectionType;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class ResumeSectionParser {
    private static final Map<String,SectionType> HEADINGS=new HashMap<>();
    static {
        add(SectionType.SUMMARY,"summary","professional summary","profile","objective");
        add(SectionType.EDUCATION,"education","academic background","academic qualifications");
        add(SectionType.SKILLS,"skills","technical skills","core competencies","technologies");
        add(SectionType.EXPERIENCE,"experience","work experience","professional experience","employment");
        add(SectionType.PROJECTS,"projects","academic projects","personal projects");
        add(SectionType.CERTIFICATIONS,"certifications","certificates");
        add(SectionType.ACHIEVEMENTS,"achievements","awards","honors","honours");
        add(SectionType.CONTACT,"contact","contact information","personal details");
    }
    private static void add(SectionType type,String... names){for(String name:names)HEADINGS.put(name,type);}
    public List<ParsedSection> parse(String text){
        List<ParsedSection> result=new ArrayList<>();SectionType current=SectionType.OTHER;StringBuilder body=new StringBuilder();int order=0;
        for(String line:TextNormalizer.normalize(text).split("\\n")){
            SectionType heading=HEADINGS.get(normalizeHeading(line));
            if(heading!=null){if(!body.toString().isBlank())result.add(section(current,body.toString(),order++));current=heading;body.setLength(0);}
            else {if(!body.isEmpty())body.append('\n');body.append(line);}
        }
        if(!body.toString().isBlank())result.add(section(current,body.toString(),order));
        if(result.isEmpty())result.add(section(SectionType.OTHER,text,0));return result;
    }
    private ParsedSection section(SectionType type,String text,int order){String raw=TextNormalizer.normalize(text);return new ParsedSection(type,raw,TextNormalizer.searchable(raw),order);}
    private String normalizeHeading(String value){String h=value.toLowerCase(Locale.ROOT).replaceAll("[:|–—-]+$","").replaceAll("[^a-z ]","").replaceAll("\\s+"," ").trim();return h.length()<=40?h:"";}
}
