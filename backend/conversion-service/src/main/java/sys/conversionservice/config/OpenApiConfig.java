package sys.conversionservice.config;

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
                        .title("Conversion Service API")
                        .version("1.0.0")
                        .description("Tracks sales conversions, validates affiliate/campaign eligibility, and calculates commissions.")
                        .contact(new Contact()
                                .name("Platform Engineering")
                                .email("eng@conversionservice.sys")
                                .url("https://docs.conversionservice.sys"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8083").description("Local Development")
                ));
    }
}