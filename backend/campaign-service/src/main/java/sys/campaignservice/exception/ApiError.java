package sys.campaignservice.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Map;
import java.time.LocalDateTime;


@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private Map<String, String> details;
    private String message;
    private String path;
}
