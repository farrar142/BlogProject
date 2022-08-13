from ast import Raise
from datetime import timedelta, datetime
import os
import locale
import subprocess
from typing import List
from pydantic import BaseModel


class DockerImage(BaseModel):
    name: str
    tag: str
    id: str
    size: float

    def remove_image(self):
        os.system(f"docker rmi -f ${self.id}")


class DockerContainer(BaseModel):
    container: str
    image: DockerImage
    port: int
    status: str

    def remove_container(self):
        os.system(f"docker rm -f ${self.container}")

    def remove_all(self):
        self.remove_container()
        self.image.remove_image()

    def restart(self):
        os.system(f"docker restart ${self.container}")


BUILD_NUMBER = int(os.getenv("BUILD_NUMBER", "1"))
PROJECT = os.getenv("JOB_NAME", "TEST")

size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")


class Docker:
    containers: List[DockerContainer] = []
    images: List[DockerImage] = []
    deployfile: str = "docker-compose-deploy.yaml"

    def __init__(self):
        self.images = self.get_docker_imgs()
        self.containers = self.get_containers()
        self.deployfile = self.find_deploy_compose()

    def find_container(self, name: str):
        matches = list(filter(lambda x: x.container == name, self.containers))
        if len(matches) >= 1:
            return matches[0]
        else:
            return False

    def get_logs(self, cmd):
        os_encoding = locale.getpreferredencoding()
        #print("System Encdoing :: ", os_encoding)
        if os_encoding.upper() == 'cp949'.upper():  # Windows
            _stdout = subprocess.Popen(
                cmd, stdout=subprocess.PIPE).stdout
            if _stdout:
                return _stdout.read().decode('utf-8').strip()
            else:
                return ""
        elif os_encoding.upper() == 'UTF-8'.upper():  # Mac&Linux
            return os.popen(cmd).read()
        else:
            print("None matched")
            exit()

    def get_cmd_list(self, cmd):
        logs = self.get_logs(cmd).split("\n")
        if len(logs) == 1:
            return []
        return logs

    def get_docker_imgs(self):
        cmd = "docker images"
        logs = self.get_cmd_list(cmd)
        logs.pop(0)
        result: List[DockerImage] = []
        if logs:
            for line in logs:
                if line:
                    words = line.split(" ")
                    while '' in words:
                        words.remove('')
                    image = DockerImage(
                        name=words[0], tag=words[1], id=words[2], size=0.0)
                    result.append(image)
        return result

    def get_ports_from_strings(self, words):
        try:
            tcp = words[-2].split("->")
            _tcp = ""
            for strings in tcp:
                if "tcp" in strings:
                    _tcp = strings
                    break
            if _tcp:
                return int(_tcp.split("/")[0])
            else:
                return 0
        except:
            return 0

    def match_container_to_img(self, image_name: str):
        return list(filter(lambda x: self.find_match(x, image_name), self.images))[0]

    def find_match(self, image: DockerImage, name: str):
        return image.id == name or image.name == name or f"{image.name}:{image.tag}" == name

    def get_containers(self):
        cmd = "docker ps -a"
        logs = self.get_cmd_list(cmd)
        logs.pop(0)
        result: List[DockerContainer] = []
        if logs:
            for line in logs:
                words = line.split("  ")

                while '' in words:
                    words.remove('')

                for i in range(len(words)):
                    words[i] = words[i].strip().strip()
                try:
                    status = words[4].strip().split(" ")[0]
                    # print(f"C Name :: {words[-1]}, C ID :: {words[0]}, Img Name :: {words[1]} , Status :: {status}")
                    container = words[-1]
                    image_name = words[1]
                    image = self.match_container_to_img(image_name)
                    port = self.get_ports_from_strings(words)
                    docker_container = DockerContainer(
                        container=container, image=image, port=port, status=status)

                    # _result.append(get_logs(
                    #     "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "+words[0]).strip("'"))
                    result.append(docker_container)
                except:
                    print("err")
                    pass
        else:
            print("No Containers")
        return result

    def find_deploy_compose(self):
        files = self.get_cmd_list("ls")
        a = "test"
        compose_files = list(filter(lambda x: x.find(
            "docker-compose.deploy") >= 0, files))
        if len(compose_files) >= 1:
            return compose_files[0]
        else:
            return self.deployfile


docker = Docker()
frontend = docker.find_container(f"{PROJECT}_frontend_{BUILD_NUMBER-1}")
backend = docker.find_container(f"{PROJECT}_backend_{BUILD_NUMBER-1}")

for container in [frontend, backend]:
    if isinstance(container, DockerContainer):
        container.remove_all()

print(docker.deployfile)
for container in docker.containers:
    print(container)
