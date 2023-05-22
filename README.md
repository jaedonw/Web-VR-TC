# Web VR-TC

### Team Name

- **_CSpain without the CS_**

### Link to Deployed Application

- [webvrtc.me](https://webvrtc.me/)

### Video Demo

- [Link](https://youtu.be/g_hB0Npusy0)

### Project and Team Member Focuses

The assignment overall will take more of a frontend focus (with VR integrated video calls) with some back-end functionality for CRUD / login verification / video connection.

Developers will take the following focuses:

- Ryan Blasetti → Full-Stack
- Lazar Glumac → Full-Stack
- Jaedon Wong → Full-Stack

### Team Member Names and Student Numbers

- Ryan Blasetti → 1005991198
- Lazar Glumac → 1006068461
- Jaedon Wong → 1006172810

### Description of the Web Application

WEB VR-TC is a web application where users can communicate with their friends in video calls and participate in real time text chats.

During video calls, users can change their avatars that puts their webcams onto 3-D character models in a controllable environment
to make chatting more engaging and fun! The web application will make use of virtual reality to facilitate this functionality.

Users will be able to manage their friend connections throughout the app by interacting with the back-end’s CRUD operations to ensure that users will have friends that they can connect with to experience WEB VR-TC’s text/video communication functionality.

### Base Complexity Points

Overall Base Complexity Points: 10

- 1 point → PeerJS (to make the real time video call)
- 2 points → Socket.IO with Redis (to implement persistent real-time in-call messaging)
- 3 points → A-Frame (to implement the VR image components)
- 2 points → Twilio (for SMS verification when forgetting password and incoming friend request notifications)
- 2 points → Stripe (to pay for "premium" and unlock additional avatars / environments)

### Bonus Complexity Points (Challenge Factor)

Overall Bonus Complexity Points: 2

- 2 points → Three.JS (for movement synchronization logic and to allow users to change the color of their avatars)

### Projected Timeline

**Alpha Version**

- Completed main back-end CRUD functionality to allow users to login / sign up / make friend connections
- Completed connection functionality to allow users to communicate with one another through video
- Completed development on aesthetic site UI elements
- Begin minor work in scoping out and implementing Beta Version tasks

**Beta Version**

- Completed video call functionality to allow for use of face-tracking to display AR images on user’s faces during calls
- Completed functionality for real-time text chat between users in call
- Completed stripe integration to allow payment for premium

**Final Version**

- Completed implementation of SMS verification using Twilio
- Tested and resolve any bugs that show up before final submission
- Refined UI features based on final design
