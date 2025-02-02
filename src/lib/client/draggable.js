// https://stackoverflow.com/a/6877405
// x- prefix because not registered with IANA
// zentara namespace to avoid conflicts
// +json suffix to indicate serialization format
export const MIME_TYPES = {
	APPLICATION_GROUP: 'application/x-zentara.application_group+json',
	APPLICATION: 'application/x-zentara.application+json',
	BOOKMARK_GROUP: 'application/x-zentara.bookmark_group+json',
	BOOKMARK: 'application/x-zentara.bookmark+json'
};
