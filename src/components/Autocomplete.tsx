import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { peopleFromServer } from '../data/people';
import { Person } from '../types/Person';
import 'bulma/css/bulma.css';

interface Delay {
  delay: number;
  onSelected: Person;
  notSelectedPerson: Person;
  rewriteOnSelected: (person: Person) => void;
}

export const Autocomplete: React.FC<Delay> = ({
  delay,
  onSelected,
  notSelectedPerson,
  rewriteOnSelected,
}) => {
  const [isShowed, setIsShowed] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [instantInoutValue, setInstantInoutValue] = useState('');

  const applyCurrentInput = useCallback(debounce(setCurrentInput, delay), []);

  const handleInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    applyCurrentInput(event.target.value);
    setInstantInoutValue(event.target.value);
    rewriteOnSelected(notSelectedPerson);
    setTimeout(() => {
      setIsShowed(true);
    }, delay);
  };

  const handleSelectedPerson = (person: Person) => {
    setInstantInoutValue(person.name);
    rewriteOnSelected(person);
  };

  const filteredPeople = useMemo(() => {
    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(currentInput.toLowerCase()),
    );
  }, [currentInput]);

  const handleInputOnFocus = () => {
    if (onSelected.name === '') {
      setIsShowed(true);
    }
  };

  const notMatch = useMemo(() => {
    if (filteredPeople.length === 0) {
      return 'No matching suggestions';
    }

    return null;
  }, [filteredPeople.length]);

  return (
    <>
      <div className={classNames('dropdown', isShowed && 'is-active')}>
        <div className="dropdown-trigger">
          <input
            value={instantInoutValue}
            type="text"
            placeholder="Enter a part of the name"
            className={classNames(
              'input',
              filteredPeople.length === 0 && 'is-danger',
            )}
            data-cy="search-input"
            onChange={handleInputValue}
            onFocus={handleInputOnFocus}
            onBlur={() => {
              setTimeout(() => {
                setIsShowed(false);
              }, 100);
            }}
          />
        </div>

        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {filteredPeople.map(person => (
              <div
                key={person.name}
                className="dropdown-item"
                data-cy="suggestion-item"
                data-person={person}
                onClick={() => handleSelectedPerson(person)}
                aria-hidden="true"
                style={{ cursor: 'pointer' }}
              >
                <p
                  className={classNames(
                    person.sex === 'm' ? 'has-text-link' : 'has-text-danger',
                  )}
                >
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={classNames(
          filteredPeople.length === 0 &&
            'notification is-danger is-light mt-3 is-align-self-flex-start',
        )}
        role="alert"
        data-cy="no-suggestions-message"
      >
        <p className="has-text-danger">{notMatch}</p>
      </div>
    </>
  );
};