import { setValorantContext, type DefaultValorantProps } from "./utils";
import { Box, Flex } from "../../styled-system/jsx";
import { sva, css } from "../../styled-system/css";
import { ValorantParticipant, Round } from "./utils";
import React from "react";

export const ValorantRoundsDetails = (props: DefaultValorantProps) => {
    setValorantContext(props);

    const { match, participant } = props;
    const rounds = match.rounds;
    console.log(rounds);
    return (
        <Flex flexDirection="row" justifyContent="space-between" flexWrap="wrap" w="1600px" p="5px">
            <RoundsHistory participant={participant} isWinner={true} rounds={rounds} />
        </Flex>
    );
};

const RoundsHistory = ({
    participant,
    isWinner,
    rounds,
}: {
    participant: ValorantParticipant;
    isWinner: boolean;
    rounds: Round;
}) => {
    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "row",
                gap: "5px",
            })}
        >
            {rounds.map((r) => {
                const styles = roundBox({winningTeam: r.winning_team });
                let imageSrc;
                switch (r.end_type) {
                    case 'Eliminated':
                        imageSrc = 'https://static-00.iconduck.com/assets.00/headshot-icon-256x251-gic18wlr.png';
                        break;
                    case 'Bomb defused':
                        imageSrc = 'https://cdn-icons-png.flaticon.com/512/28/28478.png';
                        break;
                    case 'Bomb detonated':
                        imageSrc = 'https://cdn-icons-png.flaticon.com/512/173/173473.png';
                        break;
                }
                var index = rounds.indexOf(r);
                return (
                  <React.Fragment key={index}>
                  <div className={styles.round}>
                      <h2>{index + 1}</h2>
                      <img className={styles.icon} src={imageSrc}/>
                  </div>
                  {(index === 11 || (index > 23 && index % 2 === 0)) && (
                      <img style={{ 
                        filter: "invert(100%) sepia(33%) saturate(3462%) hue-rotate(197deg) brightness(101%) contrast(101%)" 
                    }}  className={styles.switch} src="https://cdn-icons-png.flaticon.com/256/91/91873.png" alt="Switch" />
                  )}
              </React.Fragment>
                );
            })}
        </div>
    );
};

const roundBox = sva({
    slots: ["round", "switch", "icon"],
    base: {
        round: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "60px",
            height: "60px",
            backgroundColor: "gray",
            color: "white",
            border: "1px solid",
            borderColor: "black",
        },

      switch: {
        width: "50px",
       },
      icon: {
        width: "30px",
      }
    },

    variants: {
        winningTeam: {
            Red: {
                round: {
                    backgroundColor: "red",
                },
            },
            Blue: {
                round: {
                    backgroundColor: "blue",
                },
            },
        },
    },
});
