package sys.campaignservice.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public OpenAPI customOpenApi(){
        return new OpenAPI().info(
                new Info().title("Campaign Service API")
                        .version("1.0.0")
                        .description("Manages marketing campaigns, commission rates, and promotional periods.")
                        .contact(new Contact().name("Platform Engineering").email("eng@campaignservice.sys").url("https://docs.campaignservice.sys"))
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(new Server().url("http://localhost::8082").description("Local Development")));
    }
}
