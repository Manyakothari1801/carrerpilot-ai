package com.careerpilot.modules.jobmatch.embedding;import java.util.Optional;public interface EmbeddingService{Optional<double[]>embed(String minimizedText);String provider();}
