package sys.affiliateservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Affiliate Service API")
                        .version("1.0.0")
                        .description("Microservice responsible for managing affiliates and their promoted products. " +
                                "Designed for inter-service communication within the affiliate marketing platform.")
                        .contact(new Contact()
                                .name("Platform Engineering")
                                .email("eng@affiliateservice.sys")
                                .url("https://docs.affiliateservice.sys"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Local Development"),
                        new Server().url("https://affiliate-service.prod").description("Production")
                ));
    }
}