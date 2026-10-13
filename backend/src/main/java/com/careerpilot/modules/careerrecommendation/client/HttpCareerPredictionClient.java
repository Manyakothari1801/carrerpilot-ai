package com.careerpilot.modules.careerrecommendation.client;

import com.careerpilot.config.CareerRecommendationProperties;
import com.careerpilot.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
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
        client=RestClient.builder().baseUrl(properties.serviceUrl()).requestFactory(factory).requestInterceptor((request,body,execution)->{String requestId=MDC.get("requestId");if(requestId!=null)request.getHeaders().set("X-Request-Id",requestId);return execution.execute(request,body);}).build();
    }
    @Override public PredictionResponse predict(PredictionRequest request){
        return post("/predict",request,PredictionResponse.class);
    }
    @Override public ExplainResponse explain(PredictionRequest request){return post("/explain",request,ExplainResponse.class,2);}
    @Override public SimulationResponse simulate(SimulationRequest request){return post("/simulate",request,SimulationResponse.class);}
    @Override public CounterfactualResponse counterfactual(CounterfactualRequest request){return post("/counterfactual",request,CounterfactualResponse.class);}
    private <T>T post(String path,Object request,Class<T> responseType){return post(path,request,responseType,1);}
    private <T>T post(String path,Object request,Class<T> responseType,int maxAttempts){
        long started=System.nanoTime();
        for(int attempt=1;attempt<=maxAttempts;attempt++){
            try{
                T response=client.post().uri(path).body(request).retrieve().body(responseType);
                log.info("Career ML request succeeded operation={} attempt={} elapsedMs={}",path,attempt,(System.nanoTime()-started)/1_000_000);
                return response;
            }catch(RestClientResponseException exception){
                int status=exception.getStatusCode().value();boolean retry=attempt<maxAttempts&&(status==502||status==503||status==504);
                log.warn("Career ML request failed operation={} attempt={} httpStatus={} retry={} elapsedMs={}",path,attempt,status,retry,(System.nanoTime()-started)/1_000_000);
                if(!retry)throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");
            }catch(ResourceAccessException exception){
                boolean retry=attempt<maxAttempts;
                log.warn("Career ML transport failed operation={} attempt={} retry={} elapsedMs={} reason={}",path,attempt,retry,(System.nanoTime()-started)/1_000_000,exception.getClass().getSimpleName());
                if(!retry)throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");
            }
            try{Thread.sleep(250L);}catch(InterruptedException exception){Thread.currentThread().interrupt();throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");}
        }
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable");
    }
}

