package sys.affiliateservice.config;


import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Value("${service.campaign-service.url:http://localhost:8082}")
    private String campaignServiceURL;

    @Value("${service.conversion-service.url:http://localhost:8083}")
    private String conversionServiceURL;

    @Value("${service.product-service.url:http://localhost:8085}")
    private String productServiceURL;

    @Bean("campaignRestClient")
    public RestClient campaignRestClient() {
        return RestClient.builder()
                .baseUrl(campaignServiceURL)
                .requestFactory(clientHttpRequestFactory())
                .build();
    }

    @Bean("conversionRestClient")
    public RestClient conversionRestClient() {
        return RestClient.builder()
                .baseUrl(conversionServiceURL)
                .requestFactory(clientHttpRequestFactory())
                .build();
    }

    @Bean("productRestClient")
    public RestClient productRestClient() {
        return RestClient.builder()
                .baseUrl(productServiceURL)
                .requestFactory(clientHttpRequestFactory())
                .build();
    }


    private SimpleClientHttpRequestFactory clientHttpRequestFactory(){
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(15));
        return factory;
    }

}
