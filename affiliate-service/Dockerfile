# ==========================
# BUILD STAGE
# ==========================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source & build
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================
# RUN STAGE
# ==========================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port (will be overridden by docker-compose)
EXPOSE 8080

# Run with optimized JVM flags
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]