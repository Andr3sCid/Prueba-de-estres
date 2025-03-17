# Etapa 1: Construcción
FROM node:20-alpine AS builder

RUN apk add --no-cache git make curl bash

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN make

# Etapa 2: Imagen final
FROM jitsi/web:web-1.0.8281-1

# Elimina los archivos existentes en /usr/share/jitsi-meet
RUN rm -rf /usr/share/jitsi-meet/*

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /usr/src/app /usr/share/jitsi-meet

# Agrega ACME para la renovación y obtención del certificado SSL
ADD https://raw.githubusercontent.com/acmesh-official/acme.sh/3.0.7/acme.sh /opt

# Mueve la carpeta con configuraciones a la carpeta raíz del entorno
COPY ./docker-configs/rootfs/ /

# Instala los páquetes necesarios para levantar los servicios de gninx
RUN apt-dpkg-wrap apt-get update && \
    apt-dpkg-wrap apt-get install -y dnsutils cron nginx-extras socat curl jq && \
    # Mueve las configuraciones personalizadas a los archivos default para ser ocupada
    mv /usr/share/jitsi-meet/interface_config.js /defaults && \
    rm -f /etc/nginx/conf.d/default.conf && \
    apt-cleanup

EXPOSE 80 443

VOLUME ["/config", "/usr/share/jitsi-meet/transcripts"]