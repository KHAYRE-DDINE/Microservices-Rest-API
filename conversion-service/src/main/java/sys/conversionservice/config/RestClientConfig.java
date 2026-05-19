package sys.conversionservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import java.time.Duration;

@Configuration
public class RestClientConfig {

    // ✅ Add default values with Docker service names
    @Value("${service.affiliate-service.url:http://affiliate-service:8081}")
    private String affiliateUrl;

    @Value("${service.campaign-service.url:http://campaign-service:8082}")
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
        factory.setConnectTimeout(Duration.ofSeconds(5));   // ✅ Increased for Docker
        factory.setReadTimeout(Duration.ofSeconds(10));      // ✅ Increased for Docker
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}