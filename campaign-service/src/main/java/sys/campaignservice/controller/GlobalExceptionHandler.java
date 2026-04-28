package sys.campaignservice.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClient;
import sys.campaignservice.exception.ApiError;
import sys.campaignservice.exception.CampaignNotFoundException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final RestClient.Builder builder;

    public GlobalExceptionHandler(RestClient.Builder builder) {
        this.builder = builder;
    }

    @ExceptionHandler(CampaignNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(CampaignNotFoundException ex){
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((err) -> {
            errors.put(((FieldError) err).getField(), err.getDefaultMessage());
        });

        ApiError apiErr = ApiError.builder()
                .timestamp(LocalDate.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message("Validation Failed")
                .details(errors)
                .build();

        return ResponseEntity.badRequest().body(apiErr);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> GenericException(Exception ex){
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage());
    }

    public ResponseEntity<ApiError> buildError(HttpStatus status, String error, String message){
        ApiError apiError = ApiError.builder().timestamp(LocalDate.now()).status(status.value())
                .message(message).error(error).build();

        return ResponseEntity.status(status).body(apiError);
    }
}
