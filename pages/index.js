import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import axios from "axios";

export default function Home() {
    const [deck, setDeck] = useState(null);

    const [dealer, setDealer] = useState([]);
    const [dealerSum, setDealerSum] = useState(0);

    const [player, setPlayer] = useState([]);
    const [playerSum, setPlayerSum] = useState(0);

    const [show, setShow] = useState(false);

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
        if (playerSum + sum >= 21 || player.length + number > 5) return;
        let sum = 0;
        const cards = await getCard(deckID, number);
        cards.forEach((card) => {
            const value = !isNaN(card.value)
                ? Number(card.value)
                : card.value === "ACE"
                ? 11
                : 10;
            setPlayerSum((prevState) => prevState + value);
            sum += value;
        });
        setPlayer((prevState) => [...prevState, ...cards]);
        if (playerSum + sum >= 21 || player.length + number >= 5) {
            await endGame(playerSum + sum, dealerSum);
        }
    };

    const addDealerCard = async (deckID, number) => {
        let sum = 0;
        const cards = await getCard(deckID, number);
        cards.forEach((card) => {
            const value = !isNaN(card.value)
                ? Number(card.value)
                : card.value === "ACE"
                ? 11
                : 10;
            setDealerSum((prevState) => prevState + value);
            sum += value;
        });
        setDealer((prevState) => [...prevState, ...cards]);
        if (dealerSum + sum >= 21) await endGame(playerSum, dealerSum + sum);
    };

    const newDeck = async () => {
        clean();
        const deck = await api("/deck/new/shuffle/?deck_count=1");
        return deck;
    };

    async function newGame() {
        const { deck_id } = await newDeck();
        setDeck(deck_id);

        await addPlayerCard(deck_id, 2);
        await addDealerCard(deck_id, 2);
    }

    async function endGame(player, dealer) {
        setShow(true);
        setTimeout(() => {
            if (dealer > player || player > 21) {
                alert("Você Perdeu!");
            } else if (player > dealer) {
                alert("Você Ganhou!");
            } else {
                alert("Empate!");
            }

            clean();
        }, 2400);
    }

    function clean() {
        setDealer([]);
        setDealerSum(0);
        setPlayer([]);
        setPlayerSum(0);
        setDeck(null);
        setShow(false);
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
                    {dealer.map((card, index) => (
                        <Image
                            className={styles.card}
                            src={show ? card.image : "/verse.png"}
                            alt={card.code}
                            width={160}
                            height={248}
                            layout="fixed"
                            key={index}
                        />
                    ))}
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
                <button
                    className={styles.button}
                    onClick={() => addPlayerCard(deck, 1)}
                    style={{ display: deck === null ? "none" : "" }}
                >
                    Comprar
                </button>
                <button
                    className={styles.button}
                    onClick={() => endGame(playerSum, dealerSum)}
                    style={{ display: deck === null ? "none" : "" }}
                >
                    Parar
                </button>
            </div>
        </main>
    );
}
