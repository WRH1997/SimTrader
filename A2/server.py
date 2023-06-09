from concurrent import futures

import string
import random
import grpc
import computeandstorage_pb2
import computeandstorage_pb2_grpc
import socket
import boto3

"""
/*CITATION NOTE:
The following code that instantiates a S3 Boto3 Client using the 
AWS keys provided was adapted by referencing the following sources:
URL: https://medium.com/swlh/a-basic-introduction-to-boto3-a66df5548475
URL: https://stackoverflow.com/questions/45981950/how-to-specify-credentials-when-connecting-to-boto3-s3
*/
"""
s3 = boto3.client('s3',
                  aws_access_key_id="ASIAVJLVLWQFTO4QSUA4",
                  aws_secret_access_key="B1betfJLc70Xovqkp/NFVR5/52kepKzbJ/T59qGC",
                  aws_session_token="FwoGZXIvYXdzEFcaDGS6A/LAzuKvwncyniLAASKp4Ze2ccCGKaAhdnsr+5HKYrSU/+C37lbB8bx5ru5unelXt09K1/sgQC0F2OBT18RifV4u0gM+hctEG8O5qG8uHHaTjhq6hZRdaD2WK0piim70hSU+plSJxONAR7bBhIyVySD6bhm+H46Sq3KcHbxOlswmCOH60aMt6rcD7t+lSNymhJBjdSST5s/N2bG2+g6dY80wxhSQ6ChP1peaCWBhks3YPjGs+Sxan6/ohkT8RXKjjeAxQxcgkdsXski2FijW34ykBjItMNS0PJQEmTGdXaUEypfBuj6kgLOw5cQ0Jj0yOQs17MIt5CPTInUDSmWMgqH3",
                  region_name="us-east-1")

bucket_name = "csci5409-a2-wrh1997"
base_bucket_url = "https://csci5409-a2-wrh1997.s3.amazonaws.com/"
lastkey = ""
lastData = ""

"""
CITATION NOTE:
The following function (randomKeygen) was adapted from the following source:
URL: https://www.geeksforgeeks.org/python-generate-random-string-of-given-length/
"""
def randomkeygen():
    size = 5
    res = ''.join(random.choices(string.ascii_uppercase +
                                 string.digits, k=size))
    return res


"""
CITATION NOTICE:
The following source was referenced when composing the below class. Specifically, the syntax
of how to define and bind functions to the services defined in the proto file:
URL: https://www.tutorialspoint.com/grpc/grpc_helloworld_app_with_python.htm
"""
class EC2Operations(computeandstorage_pb2_grpc.EC2OperationsServicer):
    def StoreData(self, request, context):
        try:
            global lastkey
            global lastData
            generatedKey = randomkeygen()
            lastkey = generatedKey
            filename = generatedKey + '.txt'
            f = open(filename, "w")
            f.write(request.data)
            f.close()
            s3.upload_file(Bucket=bucket_name,
                           Filename=filename,
                           Key=generatedKey,
                           ExtraArgs={'ACL': 'public-read'})
            print(str(request))
            storedurl = base_bucket_url + str(generatedKey)
            return computeandstorage_pb2.StoreReply(s3uri=storedurl)
        except Exception as error:
            print(str(error))

    def AppendData(self, request, context):
        filename = lastkey + ".txt"
        f = open(filename, "a")
        f.write(request.data)
        f.close()
        s3.upload_file(Bucket=bucket_name,
                       Filename=filename,
                       Key=lastkey,
                       ExtraArgs={'ACL': 'public-read'})
        print(str(request))
        return computeandstorage_pb2.AppendReply()


    def DeleteFile(self, request, context):
        """
        CITATION NOTE:
        The following code that deletes an S3 object was adapted from the following source:
        URL: https://predictivehacks.com/?all-tips=how-to-delete-an-s3-object
        """
        s3.delete_object(Bucket=bucket_name,
                         Key=lastkey)
        print(str(request))
        return computeandstorage_pb2.DeleteReply()

"""
CITATION NOTICE:
The following code used to bind Ec2Operation's servicer, host IP, and host port to
the instantiated gRPC server was adapted from the following source:
URL: https://www.tutorialspoint.com/grpc/grpc_helloworld_app_with_python.htm
"""
def server():
    hostname = socket.gethostname()
    host_ip = socket.gethostbyname(hostname) + ':50051'
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))
    computeandstorage_pb2_grpc.add_EC2OperationsServicer_to_server(EC2Operations(), server)
    server.add_insecure_port(host_ip)
    print("Server started on " + host_ip + "...")
    server.start()
    server.wait_for_termination()


server()
