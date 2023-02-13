# Pull latest amazon linux image
FROM amazonlinux:latest

# Install required tools
RUN yum -y groupinstall "Development tools"
RUN yum install -y gcc-c++ libcurl-devel openssl-devel openssl-static zlib-devel cmake3 git
RUN pip3 install awscli

# Install AWS C++ SDK (S3 only)
RUN mkdir ~/install && git clone https://github.com/aws/aws-sdk-cpp.git && \
    cd aws-sdk-cpp && sh prefetch_crt_dependency.sh && mkdir build  && cd build && \
    cmake3 .. -DBUILD_ONLY="s3" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCUSTOM_MEMORY_MANAGEMENT=OFF \
    -DCMAKE_INSTALL_PREFIX=~/install \
    && make && make install

# Build the and install the AWS C++ runtime
RUN git clone https://github.com/awslabs/aws-lambda-cpp-runtime.git && \
    cd aws-lambda-cpp-runtime && mkdir build && cd build && \
    cmake3 .. -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_INSTALL_PREFIX=~/install \
    && make && make install

RUN mkdir src

#Get 3Dti toolkit and dependencies
RUN cd src && git clone https://github.com/3DTune-In/3dti_AudioToolkit.git && \
    cd 3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/ && \
    git clone https://github.com/USCiLab/cereal.git cereal && \
    rm -rf sofacoustics && \
    git clone https://github.com/sofacoustics/API_Cpp.git sofacoustics && \
    rm sofacoustics/libsofa/lib/libsofa.a

RUN cd src/3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/build/linux && \
    make CONFIG=Release

#copy source files
COPY main.cpp ./src/
COPY AudioFile.h ./src/
COPY CMakeLists.txt ./src/
COPY config ./root/.aws/

# Build source files
RUN mkdir build && cd build && \
    cmake3 ../src -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=~/install

#Build deployment package
RUN cd build && make && make aws-lambda-package-spatialiser

# Unzip deployment package
RUN cd build && unzip spatialiser.zip -d unpacked

# Point to compiled function
ENTRYPOINT ["/build/unpacked/bin/spatialiser"]
#CMD ["/usr/sbin/init"]