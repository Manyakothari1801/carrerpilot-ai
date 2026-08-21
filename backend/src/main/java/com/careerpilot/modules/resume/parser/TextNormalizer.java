package com.careerpilot.modules.resume.parser;
import java.util.Arrays;
import java.util.stream.Collectors;
public final class TextNormalizer {
    private TextNormalizer(){}
    public static String normalize(String value){if(value==null)return "";String v=value.replace("\r\n","\n").replace('\r','\n').replace('\u00a0',' ');return Arrays.stream(v.split("\\n")).map(line->line.replaceAll("[\\t ]+"," ").trim()).collect(Collectors.joining("\n")).replaceAll("\\n{3,}","\n\n").trim();}
    public static String searchable(String value){return normalize(value).replaceAll("\\s+"," ").trim();}
}
