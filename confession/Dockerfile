FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests
CMD ["sh", "-c", "java -jar target/*.jar"]