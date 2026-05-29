class AppError(Exception):
    def __init__(self, status_code: int, code: str, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.code = code
        self.detail = detail


class ResourceNotFoundError(AppError):
    def __init__(self, detail: str):
        super().__init__(status_code=404, code="resource_not_found", detail=detail)


class ConflictError(AppError):
    def __init__(self, detail: str):
        super().__init__(status_code=409, code="conflict", detail=detail)


class ValidationError(AppError):
    def __init__(self, detail: str):
        super().__init__(status_code=400, code="validation_error", detail=detail)


class AuthenticationError(AppError):
    def __init__(self, detail: str = "Credenciais invalidas"):
        super().__init__(status_code=401, code="authentication_error", detail=detail)


class AuthorizationError(AppError):
    def __init__(self, detail: str = "Permissao insuficiente"):
        super().__init__(status_code=403, code="authorization_error", detail=detail)
