FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S careerpilot && adduser -S careerpilot -G careerpilot
COPY --from=build /workspace/target/*.jar app.jar
USER careerpilot
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

