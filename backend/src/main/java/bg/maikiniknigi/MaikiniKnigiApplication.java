package bg.maikiniknigi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MaikiniKnigiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaikiniKnigiApplication.class, args);
    }
}
