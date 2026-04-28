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


    private SimpleClientHttpRequestFactory clientHttpRequestFactory(){
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        return factory;
    }

}
