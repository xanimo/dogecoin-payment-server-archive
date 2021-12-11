FROM debian:bookworm-slim AS build

WORKDIR /build

RUN apt-get update \
&& apt-get install -y wget \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget https://github.com/dogecoin/dogecoin/releases/download/v1.14.5/dogecoin-1.14.5-x86_64-linux-gnu.tar.gz
RUN tar -xzf dogecoin-1.14.5-x86_64-linux-gnu.tar.gz \
    --wildcards "*/dogecoin*" \
    --exclude="*-qt*" \
    --strip-components=1 \
    --one-top-level=dogecoin

FROM debian:bookworm-slim

RUN useradd dogecoin \
    && apt-get update && apt-get install gosu \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV DOGECOIN_DATA=/root/.dogecoin

COPY --from=build --chown=dogecoin:dogecoin /build/dogecoin/bin/dogecoin* /usr/local/bin/

COPY dogecoin.conf ${DOGECOIN_DATA}/dogecoin.conf

COPY entrypoint.sh /entrypoint.sh

RUN ["chmod", "+x", "/entrypoint.sh"]

VOLUME ["/dogecoin/.dogecoin"]

WORKDIR '/dogecoin'

EXPOSE 22555 22556 44555 44556 18880

ENTRYPOINT ["/entrypoint.sh"]

RUN dogecoind -version | grep "Dogecoin Core Daemon version v1.14.5"

CMD ["dogecoind", "-printtoconsole"]
