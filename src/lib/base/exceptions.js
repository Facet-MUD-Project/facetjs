/**
 * Base class for errors related to containers
 */
class ContainerError extends Error { }

/**
 * Thrown if a container cannot contain an object
 */
class CannotContain extends ContainerError { }

/**
 * Thrown if a container already contains an object
 */
class AlreadyContains extends CannotContain { }

/**
 * Thrown if a container cannot release an object
 */
class CannotRelease extends ContainerError { }

module.exports = { ContainerError, CannotContain, AlreadyContains, CannotRelease };
