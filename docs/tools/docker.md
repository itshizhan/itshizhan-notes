

# Docker笔记



## 1. 镜像与容器

A container is launched by running an image. 

**通过运行一个镜像可以启动一个容器。**

An **image** is an executable package that includes everything needed to run an application--the code, a runtime, libraries, environment variables, and configuration files.

A **container** is **a runtime instance of an image**--what the image becomes in memory when executed (that is, an image with state, or a user process). You can see a list of your running containers with the command, `docker ps`, just as you would in Linux.



```shell
docker --version
# 输出：
Docker version 18.03.0-ce, build 0520e24
# 查看当前docker支持的版本


docker info
# 查看当前安装docker 的详情信息
# 输出：
Containers: 5
 Running: 0
 Paused: 0
 Stopped: 5
Images: 8
Server Version: 18.03.0-ce
...


docker image ls
# 类似与：docker images，查看当前镜像列表
# 输出：
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
friendlyhello       latest              54835128577a        2 months ago        151MB
python              2.7-slim            46ba956c5967        2 months ago        140MB
hello-world         latest              e38bc07ac18e        3 months ago        1.85kB


docker container ls --all  
# 等同于 docker ps -a，查看当前容器的列表，如果只是查看当前运行中的容器，可以省略 --all
# 输出：
CONTAINER ID IMAGE  COMMAND   CREATED       STATUS             PORTS   NAMES
0b9d2590  hello-world "/hello" 18 mins ago  Exited18minutes ago  --    friendly_gates


# Recap and cheat sheet：常用命令回顾和备忘录
## List Docker CLI commands
docker
docker container --help

## Display Docker version and info
docker --version
docker version
docker info

## Execute Docker image
docker run hello-world

## List Docker images
docker image ls

## List Docker containers (running, all, all in quiet mode)
docker container ls
docker container ls --all
docker container ls -aq
```



## 2. Define a container with `Dockerfile`

官网标题，实际上 `Dockerfile`是用来创建镜像的。



```shell
mkdir first-demo && cd first-demo
## 新建一个空目录，然后在cd到此目录
```

- 新建Dockerfile文件

```shell

# 基础镜像 name:tag
FROM python:2.7-slim

# 设置工作目录 /app
WORKDIR /app


# 复制Dockerfile上下文的所有文件，到工作目录/app，推荐COPY命令
ADD . /app

# 安装python相关依赖
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# 对外暴露容器的端口80
EXPOSE 80

# 定义环境变量
ENV NAME World

# 容器启动时运行命令，即运行 python app.py
CMD ["python", "app.py"]
```





- 在Dockerfile文件同目录新建app本身的文件`app.py `和`requirements.txt`

```shell
# requirements.txt文件
Flask
Redis
```



```python
# app.py 文件
 
from flask import Flask
from redis import Redis, RedisError
import os
import socket

# Connect to Redis
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)

app = Flask(__name__)

@app.route("/")
def hello():
    try:
        visits = redis.incr("counter")
    except RedisError:
        visits = "<i>cannot connect to Redis, counter disabled</i>"

    html = "<h3>Hello {name}!</h3>" \
           "<b>Hostname:</b> {hostname}<br/>" \
           "<b>Visits:</b> {visits}"
    return html.format(name=os.getenv("NAME", "world"), hostname=socket.gethostname(), visits=visits)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```



- 在当前上下文基于Dockerfile 创建镜像 

```shell
docker build -t friendlyhello .
# -t 为镜像起一个友好的名称或名称+标签  'name[:tag]',如果不指定tag，默认是latest
# 如果非当前上下文，可以 -f  指定Dockerfile文件路径，默认是：'PATH/Dockerfile'

```

  

- 通过`docker image ls` 查看刚刚创建的镜像:

  

```shell
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
friendlyhello       latest              54835128577a        2 months ago        151MB
python              2.7-slim            46ba956c5967        2 months ago        140MB
hello-world         latest              e38bc07ac18e        3 months ago        1.85kB
```

  

  

- 基于friendlyhello镜像创建一个新的容器

```shell
docker run -p 4000:80 friendlyhello
# -p 将容器暴露的80端口，对外映射为4000端口
# -d 以detached mode创建

```

  

- 访问app应用

```shell
# 浏览器打开 http://localhost:4000/ ，如果windows用户：可能需要使用ip访问，
# 如：http://192.168.99.100:4000/ 	
# 输出：
Hello World!
Hostname: e3a6f1d0cf5d
Visits: cannot connect to Redis, counter disabled

```

  



- 查看当前运行的容器

```shell
$ docker container ls

# 输出：
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES

e3a6f1d0cf5d        friendlyhello       "python app.py"     2 hours ago         Up 2 hours          0.0.0.0:4000->80/tcp   trusting_elbakyan
```



- 退出应用，停止容器

`docker container stop e3a6f1d0cf5d`



Hit `CTRL+C` in your terminal to quit.

如果windows用户，可能需要`docker container stop <Container NAME or ID>` to stop the container

  

- 进入容器内部

```shell
docker exec -it e3a6f1d0cf5d /bin/bash 
# cd /app 可以看到容器内部的文件
# 输出：

root@e3a6f1d0cf5d:/app# ls
Dockerfile  app.py 	requirements.txt

```

  

- ### Tag the image



```shell
docker tag image username/repository:tag
```

例如:

```shell
docker tag friendlyhello gordon/get-started:part2
```

### 

- ### Publish the image

```shell
docker push username/repository:tag
```

 



**常用命令回顾和备忘录：**

```shell
docker build -t friendlyhello .  # Create image using this directory's Dockerfile
docker run -p 4000:80 friendlyhello  # Run "friendlyname" mapping port 4000 to 80
docker run -d -p 4000:80 friendlyhello         # Same thing, but in detached mode
docker container ls                                # List all running containers
docker container ls -a             # List all containers, even those not running
docker container stop <hash>           # Gracefully stop the specified container
docker container kill <hash>         # Force shutdown of the specified container
docker container rm <hash>        # Remove specified container from this machine
docker container rm $(docker container ls -a -q)         # Remove all containers
docker image ls -a                             # List all images on this machine
docker image rm <image id>            # Remove specified image from this machine
docker image rm $(docker image ls -a -q)   # Remove all images from this machine
docker login             # Log in this CLI session using your Docker credentials
docker tag <image> username/repository:tag  # Tag <image> for upload to registry
docker push username/repository:tag            # Upload tagged image to registry
docker run username/repository:tag                   # Run image from a registry
```

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  
