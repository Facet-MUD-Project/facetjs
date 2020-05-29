/**
 * Base class for errors related to containers
 */
export class ContainerError extends Error { }

/**
 * Thrown if a container cannot contain an object
 */
export class CannotContain extends ContainerError { }

/**
 * Thrown if a container already contains an object
 */
export class AlreadyContains extends CannotContain { }

/**
 * Thrown if a container cannot release an object
 */
export class CannotRelease extends ContainerError { }
