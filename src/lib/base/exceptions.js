class ContainerError extends Error { }

class CannotContain extends ContainerError { }

class AlreadyContains extends CannotContain { }

class CannotRelease extends ContainerError { }

module.exports = { ContainerError, CannotContain, AlreadyContains, CannotRelease };
