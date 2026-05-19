package sys.affiliateservice.exception;

public class AffiliateNotFoundException extends RuntimeException{


    public AffiliateNotFoundException(String message){
        super(message);
    }

    public AffiliateNotFoundException(Long id){
        super("Affiliate with id " + id + " Not Found");
    }

    public AffiliateNotFoundException(String fieldName, String fieldValue){
        super("Affiliate with name " + fieldName + " and value " + fieldValue +  " Not Found");
    }
}
