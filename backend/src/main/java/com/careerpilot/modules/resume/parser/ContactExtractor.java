package com.careerpilot.modules.resume.parser;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class ContactExtractor {
    private static final Pattern EMAIL=Pattern.compile("(?i)(?<![\\w.+-])[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+");
    private static final Pattern PHONE=Pattern.compile("(?<!\\d)(?:\\+?\\d{1,3}[ .-]?)?(?:\\(?\\d{3}\\)?[ .-]?)?\\d{3}[ .-]?\\d{4}(?!\\d)");
    private static final Pattern LINKEDIN=Pattern.compile("(?i)(?:https?://)?(?:www\\.)?linkedin\\.com/in/[A-Za-z0-9_%.-]+/?");
    private static final Pattern GITHUB=Pattern.compile("(?i)(?:https?://)?(?:www\\.)?github\\.com/[A-Za-z0-9_.-]+/?");
    public ContactInformation extract(String text){return new ContactInformation(first(EMAIL,text),first(PHONE,text),first(LINKEDIN,text),first(GITHUB,text));}
    private String first(Pattern pattern,String value){var matcher=pattern.matcher(value==null?"":value);return matcher.find()?matcher.group().trim():null;}
}
