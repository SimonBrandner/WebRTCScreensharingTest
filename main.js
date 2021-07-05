import "./style.css";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const localScreensharing = document.getElementById("localScreensharing");
const remoteScreensharing = document.getElementById("remoteScreensharing");

const createOfferButton = document.getElementById("createOfferButton");
const createAnswerButton = document.getElementById("createAnswerButton");
const gotAnswerButton = document.getElementById("gotAnswerButton");

const offerOutput = document.getElementById("offerOutput");
const offerInput = document.getElementById("offerInput");
const answerOutput = document.getElementById("answerOutput");
const answerInput = document.getElementById("answerInput");
const candidatesOutput = document.getElementById("candidatesOutput");
const candidatesInput = document.getElementById("candidatesInput");

let localCandidates = [];

const pc = new RTCPeerConnection();

const setupMedia = async () => {
	const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	localStream.getTracks().forEach((track) => {
		pc.addTrack(track, localStream);
	});
	localVideo.srcObject = localStream;

	const screensharingStream = await navigator.mediaDevices.getDisplayMedia();
	screensharingStream.getTracks().forEach((track) => {
		pc.addTrack(track, screensharingStream);
	});
	localScreensharing.srcObject = screensharingStream;
};

const addIceCandidates = async () => {
	const candidates = JSON.parse(candidatesInput.value);
	candidates.forEach((candidate) => {
		pc.addIceCandidate(candidate);
	});
};

pc.onicecandidate = (event) => {
	if (!event.candidate) return;
	localCandidates.push(event.candidate);
	candidatesOutput.value = JSON.stringify(localCandidates);
};

pc.ontrack = (event) => {
	const stream = event.streams[0];
	if (!remoteVideo.srcObject || remoteVideo.srcObject.id === stream.id) {
		remoteVideo.srcObject = stream;
	}
	else {
		remoteScreensharing.srcObject = stream;
	}
};

createOfferButton.onclick = async () => {
	await setupMedia();

	const offerDescription = await pc.createOffer();
	await pc.setLocalDescription(offerDescription);

	offerOutput.value = offerDescription.sdp;
};

createAnswerButton.onclick = async () => {
	const offer = offerInput.value;
	await pc.setRemoteDescription(
		new RTCSessionDescription({
			type: "offer",
			sdp: offer
		})
	);
	await setupMedia();

	const answerDescription = await pc.createAnswer();
	await pc.setLocalDescription(answerDescription);

	answerOutput.value = answerDescription.sdp;

	addIceCandidates();
};

gotAnswerButton.onclick = async () => {
	addIceCandidates();
	const answer = answerInput.value;

	await pc.setRemoteDescription(
		new RTCSessionDescription({
			type: "answer",
			sdp: answer
		})
	);
};
