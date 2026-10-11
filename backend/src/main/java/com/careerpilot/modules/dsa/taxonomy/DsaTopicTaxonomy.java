package com.careerpilot.modules.dsa.taxonomy;
import org.springframework.stereotype.Component;
import java.util.*;
@Component public class DsaTopicTaxonomy {
    public record Topic(String id,String name,int order){}
    private final List<Topic> topics=List.of(
        new Topic("arrays","Arrays",1),new Topic("strings","Strings",2),new Topic("binary-search","Binary Search",3),new Topic("linked-lists","Linked Lists",4),new Topic("recursion","Recursion",5),new Topic("bit-manipulation","Bit Manipulation",6),new Topic("stack-queue","Stack & Queue",7),new Topic("sliding-window-two-pointer","Sliding Window / Two Pointer",8),new Topic("heaps","Heaps",9),new Topic("greedy","Greedy",10),new Topic("binary-trees","Binary Trees",11),new Topic("binary-search-trees","Binary Search Trees",12),new Topic("graphs","Graphs",13),new Topic("dynamic-programming","Dynamic Programming",14),new Topic("trees","Trees",15));
    public List<Topic>all(){return topics;} public Optional<Topic>find(String id){return topics.stream().filter(v->v.id().equals(id)).findFirst();}
}
