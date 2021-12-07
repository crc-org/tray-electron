from quay.io/fedora/fedora:35

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.13.1

# install required packages
RUN dnf install -y dnf-plugins-core \
    && dnf config-manager --add-repo https://dl.winehq.org/wine-builds/fedora/35/winehq.repo \
    && dnf update -y \
    && dnf install -y python38 make gcc gcc-c++ winehq-stable

# install nvm and use it to install $NODE_VERSION
RUN mkdir -p /usr/local/nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm use $NODE_VERSION

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN mkdir /repo
COPY . /repo

WORKDIR /repo

RUN npm install && cd ./frontend && npm install

CMD ["npm", "run", "release:cross"]
