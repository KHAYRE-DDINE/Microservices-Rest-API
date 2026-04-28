package sys.conversionservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Value("${service.affiliate-service.url}")
    private String affiliateUrl;

    @Value("${service.campaign-service.url}")
    private String campaignUrl;

    @Bean("affiliateRestClient")
    public RestClient affiliateRestClient() {
        return buildClient(affiliateUrl);
    }

    @Bean("campaignRestClient")
    public RestClient campaignRestClient() {
        return buildClient(campaignUrl);
    }

    private RestClient buildClient(String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}