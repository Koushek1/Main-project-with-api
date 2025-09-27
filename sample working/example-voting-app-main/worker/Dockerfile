ARG BUILDPLATFORM=linux/amd64
ARG TARGETPLATFORM
ARG TARGETARCH
FROM --platform=${BUILDPLATFORM} mcr.microsoft.com/dotnet/sdk:7.0 AS build
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"
WORKDIR /source
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c release -o /app --self-contained false --no-restore
# app image
FROM mcr.microsoft.com/dotnet/runtime:7.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Worker.dll"]
