import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import axios from "axios";

export default function Home() {
    const [deck, setDeck] = useState("");
    const [dealer, setDealer] = useState([]);
    const [player, setPlayer] = useState([]);
    const [sum, setSum] = useState(0);

    const delay = (time) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), time);
        });
    };

    const api = async (path) => {
        try {
            const baseUrl = "https://deckofcardsapi.com/api";
            const response = await axios.get(baseUrl + path);
            return response.data;
        } catch (error) {
            throw new Error(error);
        }
    };

    const getCard = async (deckID, number) => {
        const response = await api(`/deck/${deckID}/draw/?count=${number}`);
        const card = response.cards;
        return card;
    };

    const addPlayerCard = async (deckID, number) => {
        const cards = await getCard(deckID, number);
        cards.forEach((card) => {
            const value = !isNaN(card.value)
                ? Number(card.value)
                : card.value === "ACE"
                ? 11
                : 10;
            setSum(sum + value);
        });
        setPlayer([...player, ...cards]);
    };

    const newDeck = async () => {
        setPlayer([]);
        console.log(player);

        const deck = await api("/deck/new/shuffle/?deck_count=1");
        return deck;
    };

    async function newGame() {
        const { deck_id } = await newDeck();
        await addPlayerCard(deck_id, 2);
    }

    return (
        <main className={styles.container}>
            <button
                className={`${styles.button} ${styles.absolute}`}
                onClick={newGame}
            >
                Novo Jogo
            </button>

            <div className={styles.center}>
                <div className={styles.hand}>
                    <Image
                        className={styles.card}
                        src="https://deckofcardsapi.com/static/img/8C.png"
                        alt=""
                        width={160}
                        height={248}
                        layout="fixed"
                    />
                </div>
                <div className={styles.hand}>
                    {player.map((card, index) => (
                        <Image
                            className={styles.card}
                            src={card.image}
                            alt={card.code}
                            width={160}
                            height={248}
                            layout="fixed"
                            key={index}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.options}>
                <button className={styles.button}>Comprar</button>
                <button className={styles.button}>Parar</button>
            </div>
        </main>
    );
}
