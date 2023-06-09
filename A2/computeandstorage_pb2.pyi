from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AppendReply(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class AppendRequest(_message.Message):
    __slots__ = ["data"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    data: str
    def __init__(self, data: _Optional[str] = ...) -> None: ...

class DeleteReply(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class DeleteRequest(_message.Message):
    __slots__ = ["s3uri"]
    S3URI_FIELD_NUMBER: _ClassVar[int]
    s3uri: str
    def __init__(self, s3uri: _Optional[str] = ...) -> None: ...

class StoreReply(_message.Message):
    __slots__ = ["s3uri"]
    S3URI_FIELD_NUMBER: _ClassVar[int]
    s3uri: str
    def __init__(self, s3uri: _Optional[str] = ...) -> None: ...

class StoreRequest(_message.Message):
    __slots__ = ["data"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    data: str
    def __init__(self, data: _Optional[str] = ...) -> None: ...
