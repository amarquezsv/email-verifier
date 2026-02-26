# GitHub
https://github.com/amarquezsv/email-verifier

# Prerequisites

Before building or running this project with `./gradlew`, Windows 11 users must configure the **JAVA_HOME** environment variable to point to a valid JDK installation.
If this variable is missing or incorrect, Gradle will fail to start.

## Set JAVA_HOME on Windows 11

If you already have a JDK installed (for example, JDK 21), you can set the variable temporarily in PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
```
## To set it permanently:
- Open Edit the system environment variables.
- Select Environment Variables….
- Under System variables, click New… or Edit….
- Name: JAVA_HOME
- Value: the full path to your JDK installation (e.g., C:\Program Files\Java\jdk-21.0.10).
- Save and restart your terminal.


# Required Terminals (T1–T7) for Running the Project on Windows 11
The project requires 7 terminals to be opened simultaneously.
Because this setup runs on Windows 11, each Gradle command must explicitly set the Java version before execution.

All screenshots of these steps are available in the repository under the folder:
TEST_screenshots/

## T1 — Docker Services

```powershell
docker-compose up
```

## T2 — Database Migrations

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + ($env:PATH -replace '[^;]*[Jj]ava[^;]*;', '')
./gradlew devMigrate testMigrate
```

## T3 — Notification Serve

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + ($env:PATH -replace '[^;]*[Jj]ava[^;]*;', '')
./gradlew applications:notification-server:run
```

## T4 — Registration Server

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + ($env:PATH -replace '[^;]*[Jj]ava[^;]*;', '')
./gradlew applications:registration-server:run
```

## T5 — Fake SendGrid

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + ($env:PATH -replace '[^;]*[Jj]ava[^;]*;', '')
./gradlew platform-support:fake-sendgrid:run
```

## T6 — Benchmark (requires stopping T5 first

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + ($env:PATH -replace '[^;]*[Jj]ava[^;]*;', '')
./gradlew applications:benchmark:run
./gradlew applications:benchmark:run --stacktrace
```

## T7 — Benchmark + K6 (requires stopping T5 first)


```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
./gradlew applications:benchmark:run > benchmark_results.txt
k6 run test.js > test_result_k6.txt
```


## Solution to Consistent Hash Exchange

To review the implementation, check the following file and search for the `// TODO` comment:

`applications/registration-server/src/main/kotlin/io/initialcapacity/emailverifier/registrationserver/App.kt`

Look for the marker:

```kotlin
// TODO - ## Consistent hash exchange [AM 2.26.2026]
```


# Email Verifier

An app for verifying email addresses in a registration flow, which is
designed to handle very high throughput.

## Set up

1.  Run docker-compose.

    ```shell
    docker-compose up
    ```

1.  Run migrations
    ```shell
    ./gradlew devMigrate testMigrate
    ```

## Build and run

1.  Use the [Gradle Kotlin plugin](https://kotlinlang.org/docs/gradle.html#compiler-options)
    to run tests, build, and fetch dependencies.
    For example, to build run
    ```shell
    ./gradlew build
    ```

1.  Run the notification server.
    ```shell
    ./gradlew applications:notification-server:run
    ```

    Luckily, Gradle fuzzy-matches task names, so the command can optionally be shortened to

    ```shell
    ./gradlew a:n:r
    ```

1.  Run the registration server in a separate terminal window.
    ```shell
    ./gradlew applications:registration-server:run
    ```

1.  Run the fake Sendgrid server in another separate terminal window.
    ```shell
    ./gradlew platform-support:fake-sendgrid:run
    ```

## Make requests

1.  Post to [http://localhost:8081/request-registration](http://localhost:8081/request-registration)
    to make a registration request.
    Include the email address to register in the request body.
    ```json
    {
      "email": "jenny@example.com"
    }
    ```

    Don't forget to add the content type header.
    ```text
    Content-Type: application/json
    ```

1.  Check the logs of the fake Sendgrid server for your confirmation code.
    Once you receive it, post to [http://localhost:8081/register](http://localhost:8081/register)
    to confirm your registration.
    Include your email address and confirmation code in the request body.
    ```json
    {
        "email": "jenny@example.com",
        "confirmationCode": "18675309-1234-5678-90ab-cdef00000000"
    }
    ```

    Don't forget to add the content type header.
    ```text
    Content-Type: application/json
    ```

See the `requests.http` file for sample requests

## Benchmarks

The _benchmark app_ runs a simple benchmark test against the running apps.

1.  Stop the fake Sendgrid app, then run the benchmark app with
    ```shell
    ./gradlew applications:benchmark:run
    ```

    This will send some traffic to the notification and registration servers, and will print some basic metrics to the
    console.

1.  Once the benchmark is finished, try running it again giving different values for the `REGISTRATION_COUNT`,
    `REGISTRATION_WORKER_COUNT`, and `REQUEST_WORKER_COUNT` environment variables.

1.  After getting comfortable with the environment, try running multiple instances of the notification server and the
    registration server.
    Make sure to provide a unique `PORT` environment variable to each instance of the registration server.

## Consistent hash exchange

Now that we have our system working with multiple instances, we will implement a [consistent hash exchange](https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_consistent_hash_exchange)
to better distribute load between our registration request consumers.
Look for the `TODO`s in the codebase to help you get started.


