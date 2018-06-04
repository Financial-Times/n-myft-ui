import { determineNewContentSinceTime } from './determine-new-content-since-time';
import * as storage from './storage';

export default function () {
	const storedLastVisitedAt = storage.getLastVisitedAt();
	const storedNewContentSinceTime = storage.getNewContentSinceTime();
	const newContentSinceTime = determineNewContentSinceTime(storedLastVisitedAt, storedNewContentSinceTime);

	// console.log('storedLastVisitedAt', storedLastVisitedAt);
	// console.log('storedNewContentSinceTime', storedNewContentSinceTime);
	// console.log('newContentSinceTime', newContentSinceTime);

	storage.setNewContentSinceTime(newContentSinceTime);
	storage.setLastVisitedAt();
};
