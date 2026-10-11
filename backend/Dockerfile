FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S careerpilot && adduser -S careerpilot -G careerpilot
COPY --from=build /workspace/target/*.jar app.jar
RUN mkdir -p /app/runtime/resumes && chown -R careerpilot:careerpilot /app
USER careerpilot
VOLUME ["/app/runtime/resumes"]
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

