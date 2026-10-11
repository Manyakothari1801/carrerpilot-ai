package com.careerpilot.modules.careerrecommendation.client;

import com.careerpilot.config.CareerRecommendationProperties;
import com.careerpilot.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class HttpCareerPredictionClient implements CareerPredictionClient {
    private static final Logger log=LoggerFactory.getLogger(HttpCareerPredictionClient.class);
    private final RestClient client;
    public HttpCareerPredictionClient(CareerRecommendationProperties properties){
        var factory=new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.connectTimeout());
        factory.setReadTimeout(properties.readTimeout());
        client=RestClient.builder().baseUrl(properties.serviceUrl()).requestFactory(factory).build();
    }
    @Override public PredictionResponse predict(PredictionRequest request){
        return post("/predict",request,PredictionResponse.class);
    }
    @Override public ExplainResponse explain(PredictionRequest request){return post("/explain",request,ExplainResponse.class);}
    @Override public SimulationResponse simulate(SimulationRequest request){return post("/simulate",request,SimulationResponse.class);}
    @Override public CounterfactualResponse counterfactual(CounterfactualRequest request){return post("/counterfactual",request,CounterfactualResponse.class);}
    private <T>T post(String path,Object request,Class<T> responseType){
        long started=System.nanoTime();
        try{
            T response=client.post().uri(path).body(request).retrieve().body(responseType);
            log.info("Career ML request succeeded operation={} elapsedMs={}",path,(System.nanoTime()-started)/1_000_000);
            return response;
        }catch(RestClientResponseException exception){
            log.warn("Career ML request failed operation={} httpStatus={} elapsedMs={}",path,exception.getStatusCode().value(),(System.nanoTime()-started)/1_000_000);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");
        }catch(ResourceAccessException exception){
            log.warn("Career ML transport failed operation={} elapsedMs={} reason={}",path,(System.nanoTime()-started)/1_000_000,exception.getClass().getSimpleName());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");
        }
    }
}

