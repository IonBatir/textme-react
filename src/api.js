import { auth, firestore, storage, initializeApp } from "firebase";
import firebaseConfig from "firebaseConfig";

initializeApp(firebaseConfig);

const usersRef = firestore().collection("users");
const conversationsRef = firestore().collection("conversations");

const fetchUser = userId =>
  usersRef
    .doc(userId)
    .get()
    .then(doc =>
      doc.exists
        ? Promise.resolve({ ...doc.data(), id: doc.id })
        : Promise.reject(new Error("No such document!"))
    );

export const fetchProfile = () => fetchUser(auth().currentUser.uid);

export const updateStatus = status =>
  usersRef.doc(auth().currentUser.uid).update({ status });

export const updateProfile = async profile => {
  const { uid } = auth().currentUser;
  return conversationsRef
    .where("membersId", "array-contains", uid)
    .get()
    .then(querySnapshot => {
      const conversations = [];
      querySnapshot.forEach(doc =>
        conversations.push({ ...doc.data(), id: doc.id })
      );
      const promises = conversations.map(conversation =>
        conversationsRef.doc(conversation.id).update({
          members: conversation.members.map(member =>
            member.id === uid ? { ...member, ...profile } : member
          )
        })
      );
      return Promise.all([
        usersRef.doc(auth().currentUser.uid).update(profile),
        ...promises
      ]);
    });
};

export const uploadAvatar = async avatar => {
  const fileName = `${auth().currentUser.uid}.${avatar.fileName
    .split(".")
    .pop()}`;
  const avatarRef = storage().ref(`avatars/${fileName}`);
  return avatarRef
    .putFile(avatar.uri)
    .then(() => avatarRef.getDownloadURL())
    .then(url =>
      updateProfile({ avatarURL: url })
        .then(() => Promise.resolve(url))
        .catch(error => Promise.reject(error))
    );
};

export const fetchContacts = () =>
  usersRef.get().then(querySnapshot => {
    const users = [];
    const { uid } = auth().currentUser;
    querySnapshot.forEach(
      doc => doc.id !== uid && users.push({ ...doc.data(), id: doc.id })
    );
    return Promise.resolve(users);
  });

export const fetchPersonalConversations = (successCallback, errorCallback) =>
  conversationsRef
    .where("membersId", "array-contains", auth().currentUser.uid)
    .where("member_count", "==", 2)
    .orderBy("lastTimestamp", "desc")
    .onSnapshot(
      querySnapshot => {
        const conversations = [];
        const { uid } = auth().currentUser;
        querySnapshot.forEach(doc => {
          const { members, lastFrom, lastMessage, lastTimestamp } = doc.data();
          const partner = members.find(member => member.id !== uid);
          conversations.push({
            id: doc.id,
            members,
            my: lastFrom === uid,
            name: partner.name,
            avatar: partner.avatarURL,
            lastMessage,
            lastTimestamp: lastTimestamp && lastTimestamp.toDate()
          });
        });
        successCallback(conversations);
      },
      error => errorCallback(error)
    );

export const fetchGroupConversations = (successCallback, errorCallback) =>
  conversationsRef
    .where("membersId", "array-contains", auth().currentUser.uid)
    .where("member_count", ">", 2)
    .orderBy("member_count")
    .orderBy("lastTimestamp", "desc")
    .onSnapshot(
      querySnapshot => {
        const conversations = [];
        const { uid } = auth().currentUser;
        querySnapshot.forEach(doc => {
          const {
            name,
            members,
            lastFrom,
            avatarURL,
            lastMessage,
            lastTimestamp
          } = doc.data();
          conversations.push({
            id: doc.id,
            name,
            members,
            my: lastFrom === uid,
            avatar: avatarURL,
            lastMessage,
            lastTimestamp: lastTimestamp && lastTimestamp.toDate()
          });
        });
        successCallback(conversations);
      },
      error => errorCallback(error)
    );

export const fetchMessages = (conversation, successCallback, errorCallback) =>
  conversationsRef
    .doc(conversation.id)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot(
      querySnapshot => {
        const messages = [];
        const { uid } = auth().currentUser;
        querySnapshot.forEach(doc => {
          const { from, text, timestamp } = doc.data();
          const partner = conversation.members.find(
            member => member.id === from
          );
          messages.push({
            id: doc.id,
            from,
            my: from === uid,
            avatar: partner.avatarURL,
            timestamp: timestamp.toDate(),
            text
          });
        });
        successCallback(messages);
      },
      error => errorCallback(error)
    );

export const getConversationByPartnerId = partner =>
  conversationsRef
    .where("membersId", "array-contains", auth().currentUser.uid)
    .get()
    .then(querySnapshot => {
      let conversation;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.membersId.includes(partner.id))
          conversation = { ...data, id: doc.id };
      });
      return Promise.resolve(conversation);
    });

export const createConversation = partner =>
  fetchUser(auth().currentUser.uid).then(async curUser => {
    const { uid } = auth().currentUser;
    const members = [
      { id: uid, name: curUser.name, avatarURL: curUser.avatarURL },
      { id: partner.id, name: partner.name, avatarURL: partner.avatarURL }
    ];
    return conversationsRef
      .add({
        members,
        member_count: 2,
        membersId: [uid, partner.id]
      })
      .then(doc =>
        Promise.resolve({
          id: doc.id,
          members,
          name: partner.name,
          avatar: partner.avatarURL
        })
      )
      .catch(error => Promise.reject(error));
  });

export const addMessage = async (conversationId, text) => {
  const { uid } = auth().currentUser;
  const timestamp = firestore.Timestamp.fromDate(new Date());
  return conversationsRef
    .doc(conversationId)
    .collection("messages")
    .add({ from: uid, text, timestamp })
    .then(() =>
      conversationsRef
        .doc(conversationId)
        .update({ lastFrom: uid, lastMessage: text, lastTimestamp: timestamp })
    );
};
